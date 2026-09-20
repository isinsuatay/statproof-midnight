import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

const LACE_URL = 'https://www.lace.io/';

type WalletConnectProps = {
  wallet: InitialAPI | null;
  connected: ConnectedAPI | null;
  address: string | null;
  networkId: string | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onDetectWallet: () => void;
};

export default function WalletConnect({
  wallet,
  connected,
  address,
  networkId,
  isConnecting,
  error,
  onConnect,
  onDisconnect,
  onDetectWallet,
}: WalletConnectProps) {
  const isConnected = connected !== null;

  return (
    <section>
      <h2>Wallet</h2>

      {!isConnected ? (
        <>
          <p>
            {wallet
              ? `${wallet.name} detected.`
              : 'No compatible Midnight wallet detected.'}
          </p>

          <div className="actions">
            <button
              type="button"
              onClick={onConnect}
              disabled={isConnecting || !wallet}
            >
              {isConnecting && <span className="spinner" aria-hidden="true" />}
              {isConnecting ? 'Connecting…' : 'Connect Lace'}
            </button>

            {!wallet && (
              <button type="button" onClick={onDetectWallet}>
                Check Again
              </button>
            )}
          </div>

          {!wallet && (
            <p className="hint">
              Lace is a browser extension.{' '}
              <a href={LACE_URL} target="_blank" rel="noreferrer">
                Get Lace
              </a>
            </p>
          )}
        </>
      ) : (
        <>
          <p>
            <strong>Status:</strong> Connected
          </p>

          <p>
            <strong>Network:</strong> {networkId}
          </p>

          <p
            style={{
              overflowWrap: 'anywhere',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          >
            <strong>Address:</strong> {address}
          </p>

          <button type="button" onClick={onDisconnect}>
            Disconnect
          </button>
        </>
      )}

      {error && <div role="alert">{error}</div>}
    </section>
  );
}
