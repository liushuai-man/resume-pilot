import jwt from 'jsonwebtoken';
import { z } from 'zod';

const payloadSchema = z.object({ kind: z.literal('resume_optimization_suggestion'), userId: z.string().uuid(), resumeId: z.string().uuid(), source: z.enum(['content_quality', 'job_match', 'ats']), targetId: z.string().min(1), fieldId: z.string().min(1), originalText: z.string(), suggestedText: z.string().min(1), reason: z.string().max(1000).optional(), evidence: z.string().max(4000).optional() });
export type SuggestionTokenPayload = z.infer<typeof payloadSchema>;

export function createSuggestionToken(payload: Omit<SuggestionTokenPayload, 'kind'>) {
  return jwt.sign({ kind: 'resume_optimization_suggestion', ...payload }, process.env.JWT_SECRET!, { expiresIn: '2h' });
}

export function verifySuggestionToken(token: string) {
  return payloadSchema.parse(jwt.verify(token, process.env.JWT_SECRET!));
}
