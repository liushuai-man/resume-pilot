export interface SseEnvelope<T = unknown> {
  type: string;
  sequence: number;
  runId: string;
  data: T;
}

interface SsePostOptions {
  path: string;
  body: unknown;
  signal?: AbortSignal;
  onEvent: (event: SseEnvelope) => void;
}

const parseFrames = (buffer: string) => {
  const frames = buffer.split(/\r?\n\r?\n/);
  return { complete: frames.slice(0, -1), rest: frames[frames.length - 1] || '' };
};

const parseFrame = (frame: string): SseEnvelope | null => {
  const dataLines = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart());
  if (!dataLines.length) return null;
  return JSON.parse(dataLines.join('\n')) as SseEnvelope;
};

export async function postSse({ path, body, signal, onEvent }: SsePostOptions) {
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    const message = await response.text();
    throw new Error(message || `SSE request failed: ${response.status}`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let lastSequence = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const { complete, rest } = parseFrames(buffer);
      buffer = rest;
      for (const frame of complete) {
        const event = parseFrame(frame);
        if (!event || event.type === 'heartbeat') continue;
        if (event.sequence <= lastSequence) continue;
        lastSequence = event.sequence;
        onEvent(event);
        if (event.type === 'run.failed') throw new Error((event.data as { message?: string })?.message || '流式执行失败');
      }
    }
  } finally {
    reader.releaseLock();
  }
}
