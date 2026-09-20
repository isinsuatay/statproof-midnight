import assert from 'node:assert/strict';
import test from 'node:test';

import { describeError } from '../frontend/lib/errors.js';
import { parseThreshold } from '../frontend/lib/threshold.js';

// ---------- Error messages ----------

test('a failed threshold check is explained without revealing anything', () => {
  const message = describeError(
    new Error('Private value does not satisfy the threshold'),
  );

  assert.match(message, /does not satisfy this threshold/);
  assert.match(message, /Nothing about your value was revealed/);
});

test('wallet rejections are explained for connecting and for verifying', () => {
  assert.match(
    describeError({ code: 'Rejected', reason: 'User rejected the request' }, 'connect'),
    /connection request was rejected/,
  );
  assert.match(
    describeError(new Error('Transaction rejected by user'), 'verify'),
    /Nothing was submitted/,
  );
});

test('network failures point the user to the local proof server', () => {
  assert.match(describeError(new TypeError('Failed to fetch')), /proof server/);
});

test('wrong-network errors are passed through unchanged', () => {
  const raw =
    'Wrong network: Lace is connected to "mainnet". Switch Lace to Midnight Preprod, then connect again.';

  assert.equal(describeError(new Error(raw), 'connect'), raw);
});

test('unknown and empty errors fall back to a safe message', () => {
  assert.equal(describeError(undefined), 'Verification failed. Please try again.');
  assert.equal(
    describeError(undefined, 'connect'),
    'Wallet connection failed. Please try again.',
  );
  assert.equal(describeError(new Error('x'.repeat(500))).length, 241);
});

// ---------- Threshold parsing ----------

test('parseThreshold accepts whole numbers that fit in Uint<64>', () => {
  assert.equal(parseThreshold('80'), 80n);
  assert.equal(parseThreshold(' 80 '), 80n);
  assert.equal(parseThreshold('0'), 0n);
  assert.equal(parseThreshold('18446744073709551615'), 18446744073709551615n);
});

test('parseThreshold rejects empty, negative, decimal and oversized input', () => {
  assert.equal(parseThreshold(''), null);
  assert.equal(parseThreshold('-5'), null);
  assert.equal(parseThreshold('1.5'), null);
  assert.equal(parseThreshold('1e3'), null);
  assert.equal(parseThreshold('18446744073709551616'), null);
});
