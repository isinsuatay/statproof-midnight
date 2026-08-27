import assert from 'node:assert/strict';
import test from 'node:test';

const PRIVATE_VALUE = 85n;

test('private value satisfies threshold when value >= threshold', () => {
  const threshold = 80n;

  assert.equal(PRIVATE_VALUE >= threshold, true);
});

test('private value does not satisfy threshold when value < threshold', () => {
  const threshold = 100n;

  assert.equal(PRIVATE_VALUE >= threshold, false);
});

test('private value is not part of the public ledger state', () => {
  const publicLedgerState = {
    threshold: 80n,
    verified: true,
    proofCount: 1n,
  };

  assert.equal(
    Object.prototype.hasOwnProperty.call(
      publicLedgerState,
      'privateValue',
    ),
    false,
  );

  assert.equal(
    Object.values(publicLedgerState).includes(PRIVATE_VALUE),
    false,
  );
});