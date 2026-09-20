import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  root: 'frontend',

  plugins: [
    react(),
    wasm(),
    nodePolyfills({
      include: ['buffer', 'process', 'crypto', 'stream', 'util'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],

  server: {
    fs: {
      allow: ['..', 'node_modules'],
    },
  },

  resolve: {
    dedupe: [
      '@midnight-ntwrk/ledger',
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/onchain-runtime',
      '@midnight-ntwrk/compact-runtime',
    ],
  },

  build: {
    target: 'esnext',
    modulePreload: false,
  },

  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },

  optimizeDeps: {
    include: [
      'object-inspect',
      '@subsquid/scale-codec',
    ],
    exclude: [
      '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider',
      '@midnight-ntwrk/midnight-js-protocol',
      '@midnight-ntwrk/ledger',
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/onchain-runtime',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/zswap',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
});