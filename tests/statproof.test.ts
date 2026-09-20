import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
  type CircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger,
  type Witnesses,
} from '../contracts/managed/statproof/contract/index.js';

type PrivateState = {};

// Deliberately unusual so it cannot collide with threshold or proofCount.
const SECRET_VALUE = 8675309n;
const COIN_PUBLIC_KEY = '00'.repeat(32);

function createSimulator(privateValue: bigint) {
  let witnessCalls = 0;

  const witnesses: Witnesses<PrivateState> = {
    getPrivateValue: () => {
      witnessCalls += 1;
      return [{}, privateValue];
    },
  };

  const contract = new Contract<PrivateState>(witnesses);
  const initial = contract.initialState(
    createConstructorContext<PrivateState>({}, COIN_PUBLIC_KEY),
  );

  let context: CircuitContext<PrivateState> =
    createCircuitContext<PrivateState>(
      sampleContractAddress(),
      initial.currentZswapLocalState,
      initial.currentContractState,
      initial.currentPrivateState,
    );

  return {
    initialize(threshold: bigint): void {
      context = contract.circuits.initialize(context, threshold).context;
    },
    proveThreshold(): unknown {
      const outcome = contract.circuits.proveThreshold(context);
      context = outcome.context;
      return outcome.result;
    },
    publicState() {
      return ledger(context.currentQueryContext.state);
    },
    get witnessCalls(): number {
      return witnessCalls;
    },
  };
}

const bigintReplacer = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value;

// ---------- Circuit logic ----------

test('proveThreshold succeeds when the private value is above the threshold', () => {
  const sim = createSimulator(85n);
  sim.initialize(80n);
  sim.proveThreshold();

  assert.equal(sim.publicState().verified, true);
});

test('proveThreshold succeeds when the private value equals the threshold', () => {
  const sim = createSimulator(80n);
  sim.initialize(80n);
  sim.proveThreshold();

  assert.equal(sim.publicState().verified, true);
});

test('proveThreshold fails below the threshold and leaves public state unchanged', () => {
  const sim = createSimulator(79n);
  sim.initialize(80n);

  assert.throws(
    () => sim.proveThreshold(),
    /does not satisfy the threshold/,
  );

  const state = sim.publicState();
  assert.equal(state.verified, false);
  assert.equal(state.proofCount, 0n);
});

// ---------- State transitions ----------

test('initialize publishes the threshold and starts unverified with zero proofs', () => {
  const sim = createSimulator(SECRET_VALUE);
  sim.initialize(80n);

  const state = sim.publicState();
  assert.equal(state.threshold, 80n);
  assert.equal(state.verified, false);
  assert.equal(state.proofCount, 0n);
  assert.equal(sim.witnessCalls, 0, 'initialize must not read the private value');
});

test('each successful proof increments proofCount', () => {
  const sim = createSimulator(90n);
  sim.initialize(80n);

  sim.proveThreshold();
  assert.equal(sim.publicState().proofCount, 1n);

  sim.proveThreshold();
  assert.equal(sim.publicState().proofCount, 2n);
});

// ---------- Privacy ----------

test('the private value never appears in public state or circuit output', () => {
  const sim = createSimulator(SECRET_VALUE);
  sim.initialize(80n);
  const result = sim.proveThreshold();

  const serialized = JSON.stringify(sim.publicState(), bigintReplacer);

  assert.deepEqual(
    Object.keys(JSON.parse(serialized)).sort(),
    ['proofCount', 'threshold', 'verified'],
    'public ledger must expose only threshold, verified and proofCount',
  );
  assert.equal(serialized.includes(SECRET_VALUE.toString()), false);
  assert.ok(
    result === undefined || (Array.isArray(result) && result.length === 0),
    'proveThreshold must not return the private value',
  );
  assert.equal(sim.witnessCalls, 1, 'witness is read only inside proveThreshold');
});