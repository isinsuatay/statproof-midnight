import SuperJSON from 'superjson';
import type {
  PrivateStateExport,
  PrivateStateProvider,
  ImportPrivateStatesResult,
  SigningKeyExport,
  ImportSigningKeysResult,
} from '@midnight-ntwrk/midnight-js-types';
import type { SigningKey } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';

const STORAGE_PREFIX = 'statproof:private-state:';
const SIGNING_KEY_PREFIX = 'statproof:signing-key:';

export function createBrowserPrivateStateProvider(): PrivateStateProvider {
  let contractAddress: string | null = null;

  const stateKey = (privateStateId: string) => {
    if (!contractAddress) {
      throw new Error('Contract address has not been configured.');
    }

    return `${STORAGE_PREFIX}${contractAddress}:${privateStateId}`;
  };

  const signingKeyKey = (address: string) =>
    `${SIGNING_KEY_PREFIX}${address}`;

  return {
    setContractAddress(address) {
      contractAddress = address;
    },

    async set(privateStateId, state) {
      localStorage.setItem(
        stateKey(privateStateId),
        SuperJSON.stringify(state),
      );
    },

    async get(privateStateId) {
      const raw = localStorage.getItem(stateKey(privateStateId));

      if (raw === null) {
        return null;
      }

      return SuperJSON.parse(raw);
    },

    async remove(privateStateId) {
      localStorage.removeItem(stateKey(privateStateId));
    },

    async clear() {
      if (!contractAddress) {
        throw new Error('Contract address has not been configured.');
      }

      const prefix = `${STORAGE_PREFIX}${contractAddress}:`;

      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);

        if (key?.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    },

    async setSigningKey(address, signingKey) {
      localStorage.setItem(
        signingKeyKey(address.toString()),
        SuperJSON.stringify(signingKey),
      );
    },

    async getSigningKey(address) {
      const raw = localStorage.getItem(
        signingKeyKey(address.toString()),
      );

      if (raw === null) {
        return null;
      }

      return SuperJSON.parse<SigningKey>(raw);
    },

    async removeSigningKey(address) {
      localStorage.removeItem(signingKeyKey(address.toString()));
    },

    async clearSigningKeys() {
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);

        if (key?.startsWith(SIGNING_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    },

    async exportPrivateStates(): Promise<PrivateStateExport> {
      throw new Error(
        'Private state export is not supported by the browser provider.',
      );
    },

    async importPrivateStates(
      _exportData: PrivateStateExport,
    ): Promise<ImportPrivateStatesResult> {
      throw new Error(
        'Private state import is not supported by the browser provider.',
      );
    },

    async exportSigningKeys(): Promise<SigningKeyExport> {
      throw new Error(
        'Signing key export is not supported by the browser provider.',
      );
    },

    async importSigningKeys(
      _exportData: SigningKeyExport,
    ): Promise<ImportSigningKeysResult> {
      throw new Error(
        'Signing key import is not supported by the browser provider.',
      );
    },
  };
}