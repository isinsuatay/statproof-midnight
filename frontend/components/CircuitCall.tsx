import { useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type {
  MidnightProviders,
  ProofProvider,
} from '@midnight-ntwrk/midnight-js-types';

import type * as StatProofTypes from '../../contracts/managed/statproof/contract/index.js';

type CircuitCallProps = {
  connected: ConnectedAPI | null;
  proofProvider: ProofProvider | null;
  providers: MidnightProviders | null;
  contractAddress: string;
};

const PRIVATE_VALUE = 85n;
const PRIVATE_STATE_ID = 'statProofPrivateState';

const witnesses: StatProofTypes.Witnesses<{}> = {
  getPrivateValue: () => [{}, PRIVATE_VALUE],
};

export default function CircuitCall({
  connected,
  proofProvider,
  providers,
  contractAddress,
}: CircuitCallProps) {
  const [threshold, setThreshold] = useState('80');

  const [status, setStatus] = useState<
    'idle' | 'initializing' | 'proving' | 'success' | 'error'
  >('idle');

  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!connected || !proofProvider || !providers) {
      setStatus('error');
      setMessage('Connect Lace before starting verification.');
      return;
    }

    const numericThreshold = Number(threshold);

    if (!Number.isInteger(numericThreshold) || numericThreshold < 0) {
      setStatus('error');
      setMessage('Enter a valid non-negative threshold.');
      return;
    }

    try {
      setStatus('initializing');
      setMessage(null);

      const { CompiledContract } = await import(
        '@midnight-ntwrk/midnight-js-protocol/compact-js'
      );

      const { findDeployedContract } = await import(
        '@midnight-ntwrk/midnight-js-contracts'
      );

      const StatProof = await import(
        '../../contracts/managed/statproof/contract/index.js'
      );

      const compiledContract = CompiledContract.make(
        'statproof',
        StatProof.Contract,
      ).pipe(
        CompiledContract.withWitnesses(witnesses),
        CompiledContract.withCompiledFileAssets('/zk'),
      );

      const deployed: any = await findDeployedContract(providers, {
        compiledContract: compiledContract as any,
        contractAddress,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });

      await deployed.callTx.initialize(BigInt(numericThreshold));

      setStatus('proving');
      setMessage('Generating zero-knowledge proof…');

      await deployed.callTx.proveThreshold();

      setStatus('success');
      setMessage('Verified on Midnight Preprod.');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Verification failed.',
      );
    }
  };

  return (
    <section>
      <h2>Private Verification</h2>

      <p>
        Verify that your private value satisfies a public threshold
        without revealing the value.
      </p>

      <label>
        Public threshold
        <input
          type="number"
          min="0"
          step="1"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          disabled={
            status === 'initializing' ||
            status === 'proving'
          }
        />
      </label>

      <button
        type="button"
        onClick={handleVerify}
        disabled={
          !connected ||
          !proofProvider ||
          !providers ||
          status === 'initializing' ||
          status === 'proving'
        }
      >
        {status === 'initializing'
          ? 'Preparing…'
          : status === 'proving'
            ? 'Generating proof…'
            : 'Verify Privately'}
      </button>

      <p>
        <strong>Private value:</strong> HIDDEN
      </p>

      <p>
        <strong>Privacy:</strong> Proved without revealing your input.
      </p>

      {message && (
        <p
          role="status"
          style={{
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      )}
    </section>
  );
}