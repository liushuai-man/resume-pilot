import crypto from 'crypto';

const PREFIX = 'enc:v1:';

function getKey(): Buffer {
  const raw = process.env.MODEL_CONFIG_ENCRYPTION_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MODEL_CONFIG_ENCRYPTION_KEY is required in production');
    }
    return crypto.createHash('sha256').update('resume-pilot-development-key').digest();
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('MODEL_CONFIG_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  return key;
}

export function encryptSecret(value: string): string {
  if (!value) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${PREFIX}${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptSecret(value: string): string {
  if (!value?.startsWith(PREFIX)) return value;
  const [, iv, tag, ciphertext] = value.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

export const isEncryptedSecret = (value: string) => value.startsWith(PREFIX);
