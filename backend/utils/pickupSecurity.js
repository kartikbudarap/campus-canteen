const crypto = require('crypto');

const secret = () => process.env.PICKUP_SECRET || process.env.JWT_SECRET;

const assertSecret = () => {
  if (!secret()) throw new Error('PICKUP_SECRET or JWT_SECRET must be configured');
};

const hashCredential = (value) => {
  assertSecret();
  return crypto.createHmac('sha256', secret()).update(String(value)).digest('hex');
};

const encryptCredential = (value) => {
  assertSecret();
  const key = crypto.createHash('sha256').update(secret()).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
};

const decryptCredential = (payload) => {
  assertSecret();
  const [iv, tag, encrypted] = String(payload).split('.').map((part) => Buffer.from(part, 'base64url'));
  const key = crypto.createHash('sha256').update(secret()).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};

const createPickupCredentials = () => {
  const pin = crypto.randomInt(100000, 1000000).toString();
  const token = crypto.randomBytes(32).toString('base64url');
  return {
    pin,
    token,
    codeHash: hashCredential(pin),
    tokenHash: hashCredential(token),
    credentialCiphertext: encryptCredential(JSON.stringify({ pin, token }))
  };
};

const safeMatch = (candidate, expectedHash) => {
  const actual = Buffer.from(hashCredential(candidate), 'hex');
  const expected = Buffer.from(expectedHash || '', 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

module.exports = { createPickupCredentials, decryptCredential, hashCredential, safeMatch };
