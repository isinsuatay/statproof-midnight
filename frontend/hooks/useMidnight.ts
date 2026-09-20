import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ConnectedAPI,
  InitialAPI,
} from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type {
  MidnightProviders,
  ProofProvider,
} from '@midnight-ntwrk/midnight-js-types';

import { createMidnightProviders } from '../lib/midnightProviders';

type WalletState = {
  wallet: InitialAPI | null;
  connected: ConnectedAPI | null;
  address: string | null;
  networkId: string | null;
  isConnecting: boolean;
  error: string | null;
  proofProvider: ProofProvider | null;
  providers: MidnightProviders | null;
};

const STATPROOF_CONTRACT_ADDRESS =
  '63ef8b330776f30e32a3bac80f152fc609fcc2c92c744e7ce624e3c4b3f3133b';

const DEFAULT_LOCAL_PROOF_SERVER = 'http://localhost:6300';

function getAvailableWallet(): InitialAPI | null {
  if (typeof window === 'undefined' || !window.midnight) {
    return null;
  }

  const wallets = Object.values(window.midnight);

  if (wallets.length === 0) {
    return null;
  }

  const lace = wallets.find((wallet) =>
    wallet.name.toLowerCase().includes('lace'),
  );

  return lace ?? wallets[0];
}

export function useMidnight() {
  const [state, setState] = useState<WalletState>({
    wallet: null,
    connected: null,
    address: null,
    networkId: null,
    isConnecting: false,
    error: null,
    proofProvider: null,
    providers: null,
  });

  const zkConfigProvider = useMemo(
    () =>
      new FetchZkConfigProvider(
        new URL('/zk/', window.location.origin).toString(),
        fetch.bind(window),
      ),
    [],
  );

  const detectWallet = useCallback(() => {
    const wallet = getAvailableWallet();

    setState((current) => ({
      ...current,
      wallet,
      error: wallet
        ? null
        : 'Lace wallet was not detected. Please install Lace and refresh the page.',
    }));

    return wallet;
  }, []);

  const connect = useCallback(async () => {
    const wallet = state.wallet ?? detectWallet();

    if (!wallet) {
      return;
    }

    setState((current) => ({
      ...current,
      isConnecting: true,
      error: null,
      proofProvider: null,
      providers: null,
    }));

    try {
      const connected = await wallet.connect('preprod');
      const configuration = await connected.getConfiguration();
      const addresses = await connected.getUnshieldedAddress();

      if (configuration.networkId !== 'preprod') {
        throw new Error(
          `Wrong network: expected preprod, received ${configuration.networkId}.`,
        );
      }

      setNetworkId(configuration.networkId);

      // Debug: hangi dalın seçildiğini doğrula
      console.log(
        '[debug] wallet name:',
        wallet.name,
        '| getProvingProvider type:',
        typeof connected.getProvingProvider,
      );

      let proofProvider: ProofProvider;

      // Lace, getProvingProvider() metodunu resmi olarak desteklemiyor
      // (bkz. Midnight docs) — property görünse bile çalışmayabiliyor.
      // Bu yüzden Lace'i isimle tespit edip güvenli tarafa (yerel proof
      // server) zorluyoruz; sadece Lace olmayan cüzdanlarda delege
      // proving'i deniyoruz.
      const isLace = wallet.name.toLowerCase().includes('lace');
      const supportsDelegatedProving =
        !isLace && typeof connected.getProvingProvider === 'function';

      console.log(
        '[debug] isLace:',
        isLace,
        '| supportsDelegatedProving:',
        supportsDelegatedProving,
      );

      if (supportsDelegatedProving) {
        const { dappConnectorProofProvider } = await import(
          '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider'
        );
        const { CostModel } = await import(
          '@midnight-ntwrk/midnight-js-protocol/ledger'
        );

        proofProvider = await dappConnectorProofProvider(
          connected,
          zkConfigProvider,
          CostModel.initialCostModel(),
        );
      } else {
        const { httpClientProofProvider } = await import(
          '@midnight-ntwrk/midnight-js-http-client-proof-provider'
        );

        const proverServerUri = DEFAULT_LOCAL_PROOF_SERVER;


        console.log('[debug] using local proof server at:', proverServerUri);

        proofProvider = httpClientProofProvider(
          proverServerUri,
          zkConfigProvider,
        );
      }

      const providers = await createMidnightProviders(
        connected,
        zkConfigProvider,
        proofProvider,
      );

      setState({
        wallet,
        connected,
        address: addresses.unshieldedAddress,
        networkId: configuration.networkId,
        isConnecting: false,
        error: null,
        proofProvider,
        providers,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        isConnecting: false,
        proofProvider: null,
        providers: null,
        error:
          error instanceof Error
            ? error.message
            : 'Wallet connection was rejected or failed.',
      }));
    }
  }, [detectWallet, state.wallet, zkConfigProvider]);

  const disconnect = useCallback(() => {
    setState((current) => ({
      ...current,
      connected: null,
      address: null,
      networkId: null,
      proofProvider: null,
      providers: null,
      error: null,
    }));
  }, []);

  useEffect(() => {
    detectWallet();
  }, [detectWallet]);

  return {
    ...state,
    contractAddress: STATPROOF_CONTRACT_ADDRESS,
    zkConfigProvider,
    detectWallet,
    connect,
    disconnect,
  };
}