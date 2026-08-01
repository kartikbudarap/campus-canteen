const test = require('node:test');
const assert = require('node:assert/strict');

process.env.PICKUP_SECRET = 'test-only-pickup-secret';
const { createPickupCredentials, decryptCredential, safeMatch } = require('../utils/pickupSecurity');

test('pickup credentials can be decrypted and matched', () => {
  const credentials = createPickupCredentials();
  const decrypted = JSON.parse(decryptCredential(credentials.credentialCiphertext));

  assert.match(credentials.pin, /^\d{6}$/);
  assert.equal(decrypted.pin, credentials.pin);
  assert.equal(decrypted.token, credentials.token);
  assert.equal(safeMatch(credentials.pin, credentials.codeHash), true);
  assert.equal(safeMatch(credentials.token, credentials.tokenHash), true);
  assert.equal(safeMatch('000000', credentials.codeHash), false);
});

test('each pickup pass is unique', () => {
  const first = createPickupCredentials();
  const second = createPickupCredentials();
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.credentialCiphertext, second.credentialCiphertext);
});
