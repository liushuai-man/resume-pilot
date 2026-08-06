import crypto from 'crypto';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { prisma } from '../../database/prisma';
import {
  getEmbeddingModelConfig,
  getDecryptedApiKey,
} from '../../services/model-config.service';
import { createUserLLM } from '../providers/llm.provider';
import type { ChatMessage } from '../types/chat.types';

type RetrievalMode = 'vector' | 'keyword' | 'none';

export interface RetrievalResult {
  context: string;
  mode: RetrievalMode;
  count: number;
}

interface RetrieveMemoryOptions {
  sessionId: string;
  query: string;
  userId?: string;
  messages?: ChatMessage[];
  k?: number;
}

interface EmbeddingRuntime {
  embeddings: OpenAIEmbeddings;
  modelKey: string;
}

interface MemoryRow {
  content: string;
  content_hash: string;
  metadata: Record<string, unknown> | null;
  similarity?: number;
}

const MAX_STORED_MEMORIES = 300;
const VECTOR_SIMILARITY_THRESHOLD = 0.2;

function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function vectorLiteral(values: number[]): string {
  if (!values.length || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Embedding model returned an invalid vector');
  }
  return `[${values.join(',')}]`;
}

function turnContent(userMessage: string, assistantMessage: string): string {
  return `用户：${userMessage.trim()}\n助手：${assistantMessage.trim()}`;
}

function tokenize(text: string): Set<string> {
  const normalized = text.toLowerCase();
  const tokens = new Set<string>();
  for (const word of normalized.match(/[a-z0-9+#.]{2,}/g) || []) {
    tokens.add(word);
  }
  const chinese = normalized.replace(/[^\u4e00-\u9fff]/g, '');
  for (let index = 0; index < chinese.length; index += 1) {
    tokens.add(chinese[index]);
    if (index < chinese.length - 1) tokens.add(chinese.slice(index, index + 2));
  }
  return tokens;
}

/** Build hashes for turns already present in the short-term prompt to avoid duplicates. */
function currentTurnHashes(messages: ChatMessage[]): Set<string> {
  const hashes = new Set<string>();
  for (let index = 0; index < messages.length - 1; index += 1) {
    const current = messages[index];
    const next = messages[index + 1];
    if (current.role === 'user' && next.role === 'assistant') {
      hashes.add(hash(turnContent(current.content, next.content)));
      index += 1;
    }
  }
  return hashes;
}

function rankByKeyword(
  rows: MemoryRow[],
  query: string,
  excludedHashes: Set<string>,
  k: number
): RetrievalResult {
  const queryTokens = tokenize(query);
  const ranked = rows
    .filter((row) => !excludedHashes.has(row.content_hash))
    .map((row, index) => {
      const candidateTokens = tokenize(row.content);
      let score = 0;
      for (const token of queryTokens) {
        if (candidateTokens.has(token)) score += token.length > 1 ? 3 : 1;
      }
      return { ...row, score, index };
    })
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, k);

  if (ranked.length === 0) return { context: '', mode: 'none', count: 0 };
  return {
    context: ranked
      .map((row, index) => `[长期记忆 ${index + 1}]\n${row.content}`)
      .join('\n\n'),
    mode: 'keyword',
    count: ranked.length,
  };
}

export class VectorMemoryManager {
  private async getEmbeddingRuntime(userId: string): Promise<EmbeddingRuntime | null> {
    const config = await getEmbeddingModelConfig(userId);
    if (!config) return null;

    const apiKey = await getDecryptedApiKey(config);
    return {
      embeddings: new OpenAIEmbeddings({
        modelName: config.model_name,
        openAIApiKey: apiKey,
        timeout: 20000,
        configuration: { baseURL: config.base_url || undefined },
      }),
      modelKey: `${config.id}:${config.model_name}:${config.base_url || 'default'}`,
    };
  }

  private async recentTextMemories(userId: string): Promise<MemoryRow[]> {
    return (await prisma.$queryRawUnsafe(
      `SELECT "content", "content_hash", "metadata"
       FROM "ai_memories"
       WHERE "user_id" = $1
       ORDER BY "created_at" DESC
       LIMIT 100`,
      userId
    )) as MemoryRow[];
  }

  private async keywordMemory(
    userId: string,
    query: string,
    excludedHashes: Set<string>,
    k: number
  ): Promise<RetrievalResult> {
    try {
      return rankByKeyword(
        await this.recentTextMemories(userId),
        query,
        excludedHashes,
        k
      );
    } catch (error) {
      console.warn('Keyword memory retrieval unavailable:', error);
      return { context: '', mode: 'none', count: 0 };
    }
  }

  private async searchVectors(
    userId: string,
    modelKey: string,
    queryVector: number[],
    excludedHashes: Set<string>,
    k: number
  ): Promise<RetrievalResult> {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "content", "content_hash", "metadata",
              1 - ("embedding" <=> $1::vector) AS "similarity"
       FROM "ai_memories"
       WHERE "user_id" = $2
         AND "embedding" IS NOT NULL
         AND "embedding_model" = $3
         AND "embedding_dimension" = $4
       ORDER BY "embedding" <=> $1::vector
       LIMIT $5`,
      vectorLiteral(queryVector),
      userId,
      modelKey,
      queryVector.length,
      Math.max(k * 3, k)
    )) as MemoryRow[];

    const relevantRows = rows
      .filter(
        (row) =>
          !excludedHashes.has(row.content_hash) &&
          Number(row.similarity) >= VECTOR_SIMILARITY_THRESHOLD
      )
      .slice(0, k);
    if (relevantRows.length === 0) {
      return { context: '', mode: 'vector', count: 0 };
    }

    return {
      context: relevantRows
        .map((row, index) => {
          const similarity = Math.round(Number(row.similarity) * 100);
          return `[长期记忆 ${index + 1}｜相关度 ${similarity}%]\n${row.content}`;
        })
        .join('\n\n'),
      mode: 'vector',
      count: relevantRows.length,
    };
  }

  /** Retrieve semantically related historical chat turns, never resume content. */
  async retrieveMemory(options: RetrieveMemoryOptions): Promise<RetrievalResult> {
    const { query, userId, messages = [], k = 5 } = options;
    if (!userId || !query.trim()) return { context: '', mode: 'none', count: 0 };

    const excludedHashes = currentTurnHashes(messages);
    try {
      const runtime = await this.getEmbeddingRuntime(userId);
      if (!runtime) {
        return await this.keywordMemory(userId, query, excludedHashes, k);
      }

      const queryVector = await runtime.embeddings.embedQuery(query);
      const vectorResult = await this.searchVectors(
        userId,
        runtime.modelKey,
        queryVector,
        excludedHashes,
        k
      );
      if (vectorResult.count > 0) return vectorResult;
      return await this.keywordMemory(userId, query, excludedHashes, k);
    } catch (error) {
      console.warn('Vector memory retrieval failed; using keyword memory:', error);
      return await this.keywordMemory(userId, query, excludedHashes, k);
    }
  }

  /** Persist one completed Q&A as an episodic long-term memory. */
  async addConversationTurn(
    sessionId: string,
    userMessage: string,
    assistantMessage: string,
    userId?: string,
    resumeId?: string
  ): Promise<void> {
    if (!userId || !userMessage.trim() || !assistantMessage.trim()) return;

    const content = turnContent(userMessage, assistantMessage);
    const contentHash = hash(content);
    let vector: number[] | null = null;
    let modelKey: string | null = null;

    try {
      const runtime = await this.getEmbeddingRuntime(userId);
      if (runtime) {
        vector = await runtime.embeddings.embedQuery(content);
        modelKey = runtime.modelKey;
      }
    } catch (error) {
      // Text memory remains useful for keyword fallback even when embeddings fail.
      console.warn('Unable to embed memory; saving text memory only:', error);
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO "ai_memories" (
           "id", "user_id", "session_id", "resume_id", "content", "content_hash",
           "metadata", "embedding", "embedding_dimension", "embedding_model"
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::vector, $9, $10)
         ON CONFLICT ("user_id", "session_id", "content_hash")
         DO UPDATE SET
           "content" = EXCLUDED."content",
           "content_hash" = EXCLUDED."content_hash",
           "metadata" = EXCLUDED."metadata",
           "embedding" = COALESCE(EXCLUDED."embedding", "ai_memories"."embedding"),
           "embedding_dimension" = COALESCE(EXCLUDED."embedding_dimension", "ai_memories"."embedding_dimension"),
           "embedding_model" = COALESCE(EXCLUDED."embedding_model", "ai_memories"."embedding_model"),
           "updated_at" = CURRENT_TIMESTAMP`,
        crypto.randomUUID(),
        userId,
        sessionId,
        resumeId || null,
        content,
        contentHash,
        JSON.stringify({ sessionId, resumeId: resumeId || null, type: 'conversation_turn' }),
        vector ? vectorLiteral(vector) : null,
        vector?.length || null,
        modelKey
      );

      await tx.$executeRawUnsafe(
        `DELETE FROM "ai_memories"
         WHERE "id" IN (
           SELECT "id" FROM "ai_memories"
           WHERE "user_id" = $1
           ORDER BY "created_at" DESC
           OFFSET $2
         )`,
        userId,
        MAX_STORED_MEMORIES
      );
    });
  }

  async generateSessionSummary(sessionId: string, userId?: string): Promise<string> {
    if (!userId) return '暂无对话记录';
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "content" FROM "ai_memories"
       WHERE "user_id" = $1
         AND "session_id" = $2
       ORDER BY "created_at" ASC
       LIMIT 100`,
      userId,
      sessionId
    )) as Array<{ content: string }>;
    if (rows.length === 0) return '暂无对话记录';

    const summaryPrompt = PromptTemplate.fromTemplate(
      `请为以下简历助手对话生成不超过100字的摘要：\n\n{content}\n\n摘要：`
    );
    const llm = await createUserLLM(userId, { temperature: 0.3, maxTokens: 500 });
    const chain = RunnableSequence.from([
      summaryPrompt,
      llm,
      new StringOutputParser(),
    ]);
    return await chain.invoke({ content: rows.map((row) => row.content).join('\n\n') });
  }

  async clearSession(sessionId: string, userId?: string): Promise<void> {
    if (!userId) return;
    await prisma.$executeRawUnsafe(
      `DELETE FROM "ai_memories"
       WHERE "user_id" = $1
         AND "session_id" = $2`,
      userId,
      sessionId
    );
  }
}

export const vectorMemoryManager = new VectorMemoryManager();
