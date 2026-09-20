import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type {
  MidnightProviders,
  ProofProvider,
  WalletProvider,
  MidnightProvider,
} from '@midnight-ntwrk/midnight-js-types';

import { createBrowserPrivateStateProvider } from './browserPrivateStateProvider';

const INDEXER_URL =
  'https://indexer.preprod.midnight.network/api/v4/graphql';

const INDEXER_WS_URL =
  'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid transaction hex: odd number of characters.');
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

export async function createMidnightProviders(
  connected: ConnectedAPI,
  zkConfigProvider: MidnightProviders['zkConfigProvider'],
  proofProvider: ProofProvider,
): Promise<MidnightProviders> {
  const shieldedAddresses = await connected.getShieldedAddresses();

  const privateStateProvider = createBrowserPrivateStateProvider();

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,

    getEncryptionPublicKey: () =>
      shieldedAddresses.shieldedEncryptionPublicKey,

    async balanceTx(
      tx: Parameters<ProofProvider['proveTx']>[0] extends never
        ? never
        : any,
    ): Promise<FinalizedTransaction> {
      const serialized = toHex(tx.serialize());

      const balanced = await connected.balanceUnsealedTransaction(serialized);

      return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
        'signature',
        'proof',
        'binding',
        fromHex(balanced.tx),
      );
    },
  };

  const midnightProvider: MidnightProvider = {
    async submitTx(tx: FinalizedTransaction): Promise<TransactionId> {
      const serialized = toHex(tx.serialize());

      await connected.submitTransaction(serialized);

      return tx.identifiers()[0];
    },
  };

  const publicDataProvider = indexerPublicDataProvider(
    INDEXER_URL,
    INDEXER_WS_URL,
  );

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };
}