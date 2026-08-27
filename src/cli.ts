import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import {
  resolveNetwork,
  getOrCreateWallet,
  formatWalletBackupNotice,
  getDeployment,
} from './network';
import {
  createWallet,
  persistWalletState,
  unshieldedToken,
  type WalletContext,
} from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// Enable WebSocket for wallet sync / GraphQL subscriptions
// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

// Must match the privateStateId used at deploy time.
const PRIVATE_STATE_ID = 'statProofPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;

{
  const notice = formatWalletBackupNotice(WALLET, network);
  if (notice) console.log(notice);
}

// ─── Compiled contract ────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const zkConfigPath = path.resolve(
  __dirname,
  '..',
  'contracts',
  'managed',
  'statproof',
);

const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error(
    '\n❌ StatProof contract not compiled! Run: npm run compile\n',
  );
  process.exit(1);
}

const StatProof = await import(pathToFileURL(contractPath).href);

// The StatProof contract requires the getPrivateValue witness.
// This demo witness returns 85 as the private value.
// The value is used inside the ZK circuit and is NOT written to the ledger.
const witnesses = {
  getPrivateValue: () => {
    return [{}, 85n];
  },
};

const baseContract = CompiledContract.make(
  'statproof',
  StatProof.Contract,
);

const contractWithWitnesses = (
  CompiledContract.withWitnesses as any
)(
  baseContract,
  witnesses,
);

const compiledContract = (
  CompiledContract.withCompiledFileAssets as any
)(
  contractWithWitnesses,
  zkConfigPath,
);

// ─── Providers ────────────────────────────────────────────────────────────────

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() ||
    'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () =>
      walletCtx.shieldedSecretKeys.coinPublicKey,

    getEncryptionPublicKey: () =>
      walletCtx.shieldedSecretKeys.encryptionPublicKey,

    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: walletCtx.shieldedSecretKeys,
          dustSecretKey: walletCtx.dustSecretKey,
        },
        {
          ttl:
            ttl ??
            new Date(Date.now() + 30 * 60 * 1000),
        },
      );

      return walletCtx.wallet.finalizeRecipe(recipe);
    },

    submitTx: (tx: any) =>
      walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider =
    new NodeZkConfigProvider(zkConfigPath);

  const accountId =
    walletCtx.unshieldedKeystore
      .getBech32Address()
      .toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'statproof-state',
      accountId,
      privateStoragePasswordProvider: () =>
        privateStatePassword,
    }),

    publicDataProvider: indexerPublicDataProvider(
      networkConfig.indexer,
      networkConfig.indexerWS,
    ),

    zkConfigProvider,

    proofProvider: httpClientProofProvider(
      networkConfig.proofServer,
      zkConfigProvider,
    ),

    walletProvider,

    midnightProvider: walletProvider,
  };
}

// ─── Main CLI ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    '\n╔══════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '║                  StatProof CLI                              ║',
  );
  console.log(
    '╚══════════════════════════════════════════════════════════════╝\n',
  );

  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  const deployment = getDeployment(network);

  if (!deployment) {
    console.error(
      `No deploy on file for network ${network}. ` +
      `Run \`npm run deploy -- --network ${network}\` first.`,
    );
    rl.close();
    process.exit(1);
  }

  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);

  let walletCtx: WalletContext | undefined;

  try {
    console.log('  Connecting to wallet...');

    walletCtx = await createWallet({
      network,
      networkConfig,
      seed: SEED,
    });

    const restoredCount =
      Object.values(walletCtx.restored).filter(Boolean).length;

    if (restoredCount > 0) {
      console.log(
        `  Restored ${restoredCount}/3 child wallets from ` +
        `.midnight-wallet-state.`,
      );
    }

    console.log('  Syncing with network...');
    console.log(
      '  ℹ This may take several minutes depending on network size.\n',
    );

    const syncStart = Date.now();

    const syncInterval = setInterval(() => {
      const elapsed = Math.round(
        (Date.now() - syncStart) / 1000,
      );

      process.stdout.write(
        `\r  ⏳ Still syncing... (${elapsed}s elapsed)   `,
      );
    }, 5000);

    const state =
      await walletCtx.wallet.waitForSyncedState();

    clearInterval(syncInterval);

    process.stdout.write(
      '\r  ✓ Synced with network.                                      \n',
    );

    await persistWalletState(network, walletCtx);

    const balance =
      state.unshielded.balances[
      unshieldedToken().raw
      ] ?? 0n;

    console.log(
      `  Balance: ${balance.toLocaleString()} tNIGHT\n`,
    );

    if (
      balance === 0n &&
      network !== 'undeployed' &&
      networkConfig.faucet
    ) {
      const address =
        walletCtx.unshieldedKeystore.getBech32Address();

      console.log(
        '  ⚠ Wallet has no tNIGHT. Fund it from the faucet:\n',
      );
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }

    console.log('  Connecting to StatProof contract...');

    const providers = await createProviders(walletCtx);

    const deployed: any =
      await findDeployedContract(providers, {
        compiledContract: compiledContract as any,
        contractAddress: deployment.address,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });

    console.log('  ✅ Connected!\n');

    let running = true;

    while (running) {
      console.log(
        '─── StatProof Menu ──────────────────────────────────────────',
      );
      console.log('  1. Initialize threshold');
      console.log('  2. Prove private value ≥ threshold');
      console.log('  3. Read public contract state');
      console.log('  4. Check wallet balance');
      console.log('  5. Exit\n');

      const choice = await rl.question(
        '  Your choice: ',
      );

      switch (choice.trim()) {
        // ──────────────────────────────────────────────────────────
        // Initialize
        // ──────────────────────────────────────────────────────────
        case '1': {
          const input =
            await rl.question(
              '  Enter public threshold (0-18446744073709551615): ',
            );

          const threshold = BigInt(input.trim());

          console.log(
            '\n  Submitting initialize transaction...',
          );

          try {
            const tx =
              await deployed.callTx.initialize(
                threshold,
              );

            console.log(
              '\n  ✅ Threshold initialized:',
              threshold.toString(),
            );

            console.log(
              `  Transaction ID: ${tx.public.txId}`,
            );

            console.log(
              `  Block height: ${tx.public.blockHeight}\n`,
            );
          } catch (error) {
            console.error('\n  ❌ Failed:', error);

            if (error instanceof Error) {
              console.error('\n  Message:', error.message);
              console.error('\n  Stack:\n', error.stack);

              if (error.cause) {
                console.error('\n  Cause:', error.cause);
              }
            }
          }

          break;
        }

        // ──────────────────────────────────────────────────────────
        // Prove threshold
        // ──────────────────────────────────────────────────────────
        case '2': {
          console.log(
            '\n  Proving private value ≥ public threshold...',
          );

          console.log(
            '  Private witness value: 85',
          );

          console.log(
            '  The private value is NOT written to the public ledger.\n',
          );

          try {
            const tx =
              await deployed.callTx.proveThreshold();

            console.log(
              '  ✅ Threshold proof accepted!',
            );

            console.log(
              `  Transaction ID: ${tx.public.txId}`,
            );

            console.log(
              `  Block height: ${tx.public.blockHeight}\n`,
            );
          } catch (error) {
            console.error(
              '\n  ❌ Proof failed:',
              error instanceof Error
                ? error.message
                : error,
            );

            console.log(
              '\n  ℹ The configured private value is 85.',
            );
            console.log(
              '    The proof succeeds only when the public threshold ≤ 85.\n',
            );
          }

          break;
        }

        // ──────────────────────────────────────────────────────────
        // Read public state
        // ──────────────────────────────────────────────────────────
        case '3': {
          console.log(
            '\n  Reading public contract state...',
          );

          try {
            const contractState =
              await providers.publicDataProvider
                .queryContractState(
                  deployment.address,
                );

            if (!contractState) {
              console.log(
                '\n  📋 Contract state not found.\n',
              );
              break;
            }

            const ledgerState =
              StatProof.ledger(
                contractState.data,
              );

            console.log(
              '\n  📋 Public Ledger State',
            );

            console.log(
              `     threshold: ${ledgerState.threshold.toString()}`,
            );

            console.log(
              `     verified: ${ledgerState.verified}`,
            );

            console.log(
              `     proofCount: ${ledgerState.proofCount.toString()}`,
            );

            console.log(
              '\n  🔒 Private value: NOT stored on public ledger\n',
            );
          } catch (error) {
            console.error(
              '\n  ❌ Failed:',
              error instanceof Error
                ? error.message
                : error,
            );
          }

          break;
        }

        // ──────────────────────────────────────────────────────────
        // Balance
        // ──────────────────────────────────────────────────────────
        case '4': {
          console.log(
            '\n  Checking balance...',
          );

          const currentState =
            await walletCtx.wallet.waitForSyncedState();

          const currentBalance =
            currentState.unshielded.balances[
            unshieldedToken().raw
            ] ?? 0n;

          const dustBalance =
            currentState.dust.balance(new Date());

          console.log(
            `\n  tNIGHT: ${currentBalance.toLocaleString()}`,
          );

          console.log(
            `  DUST: ${dustBalance.toLocaleString()}\n`,
          );

          break;
        }

        case '5':
          running = false;
          console.log('\n  👋 Goodbye!\n');
          break;

        default:
          console.log(
            '\n  ❌ Invalid choice. Please enter 1-5.\n',
          );
      }
    }

    await persistWalletState(
      network,
      walletCtx,
    );
  } catch (error) {
    console.error(
      '\n❌ Error:',
      error instanceof Error
        ? error.message
        : error,
    );
  } finally {
    if (walletCtx) {
      await walletCtx.wallet.stop();
    }

    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});