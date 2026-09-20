import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

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
    <section
      style={{
        padding: '24px',
        border: '1px solid #ddd',
        borderRadius: '16px',
        marginBottom: '24px',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Wallet</h2>

      {!isConnected ? (
        <>
          <p>
            {wallet
              ? `${wallet.name} detected.`
              : 'No compatible Midnight wallet detected.'}
          </p>

          <button
            onClick={onConnect}
            disabled={isConnecting || !wallet}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              cursor: isConnecting || !wallet ? 'default' : 'pointer',
              fontWeight: 600,
            }}
          >
            {isConnecting ? 'Connecting…' : 'Connect Lace'}
          </button>

          {!wallet && (
            <button
              onClick={onDetectWallet}
              style={{
                marginLeft: '10px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Check Again
            </button>
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

          <button
            onClick={onDisconnect}
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </>
      )}

      {error && (
        <p
          role="alert"
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            background: '#fff1f1',
          }}
        >
          {error}
        </p>
      )}
    </section>
  );
}