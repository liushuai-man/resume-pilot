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
  const parts = value.slice(PREFIX.length).split(':');
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error('模型 API Key 密文格式无效，请在模型管理中重新填写 API Key 并保存');
  }
  const [iv, tag, ciphertext] = parts;
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  try {
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error(
      '模型 API Key 无法解密，请确认生产环境加密密钥未改变，或在模型管理中重新填写 API Key 并保存'
    );
  }
}

export const isEncryptedSecret = (value: string) => value.startsWith(PREFIX);
