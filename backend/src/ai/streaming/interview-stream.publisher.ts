import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import type {
  InterviewStreamEvent,
  InterviewStreamEventType,
  InterviewStreamOperation,
  PublicInterviewStage,
} from './interview-stream.events';

const HEARTBEAT_MS = 15_000;

export class InterviewStreamPublisher {
  private sequence = 0;
  private heartbeat: NodeJS.Timeout | null = null;
  private closed = false;

  constructor(
    private readonly res: Response,
    private readonly runId: string,
    private readonly operation: InterviewStreamOperation,
    private sessionId?: string
  ) {}

  open() {
    this.res.status(200);
    this.res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    this.res.setHeader('Cache-Control', 'no-cache, no-transform');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('X-Accel-Buffering', 'no');
    this.res.flushHeaders?.();
    this.heartbeat = setInterval(() => {
      void this.send('heartbeat', {});
    }, HEARTBEAT_MS);
  }

  setSessionId(sessionId?: string) {
    if (sessionId) this.sessionId = sessionId;
  }

  async started(data: Record<string, unknown> = {}) {
    await this.send('run.started', { runId: this.runId, ...data });
  }

  async stage(stage: PublicInterviewStage) {
    await this.send('stage.changed', { stage });
  }

  async committed(data: unknown) {
    await this.send('result.committed', data);
  }

  async completed() {
    await this.stage('completed');
    await this.send('run.completed', {});
  }

  async failed(data: unknown) {
    await this.send('run.failed', data);
  }

  close() {
    this.closed = true;
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.res.end();
  }

  async send<T>(type: InterviewStreamEventType, data: T) {
    if (this.closed || this.res.destroyed) return;
    const sequence = ++this.sequence;
    const payload: InterviewStreamEvent<T> = {
      version: 1,
      eventId: `${this.runId}:${sequence}`,
      runId: this.runId,
      sessionId: this.sessionId,
      operation: this.operation,
      sequence,
      timestamp: new Date().toISOString(),
      type,
      data,
    };
    const frame = `event: ${type}\nid: ${sequence}\ndata: ${JSON.stringify(payload)}\n\n`;
    if (!this.res.write(frame)) {
      await new Promise<void>((resolve) => this.res.once('drain', resolve));
    }
  }
}

export const createRunId = () => `run_${randomUUID()}`;
