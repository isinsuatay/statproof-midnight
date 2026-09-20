import './styles/App.css';
import { useMidnight } from './hooks/useMidnight';
import WalletConnect from './components/WalletConnect';
import CircuitCall from './components/CircuitCall';

function shorten(value: unknown): string {
  const s = typeof value === 'string' ? value : '';
  return s.length > 20 ? `${s.slice(0, 10)}…${s.slice(-8)}` : s;
}

function MoonMark() {
  return (
    <svg
      className="brand__mark"
      viewBox="0 0 32 32"
      width="28"
      height="28"
      aria-hidden="true"
    >
      <defs>
        <mask id="statproof-crescent">
          <rect width="32" height="32" fill="#fff" />
          <circle cx="21.5" cy="13" r="11" fill="#000" />
        </mask>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="currentColor"
        mask="url(#statproof-crescent)"
      />
    </svg>
  );
}

export default function App() {
  const {
    wallet,
    connected,
    address,
    networkId,
    isConnecting,
    error,
    connect,
    disconnect,
    detectWallet,
    proofProvider,
    providers,
    contractAddress,
  } = useMidnight();

  const contract = shorten(contractAddress);

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="StatProof home">
          <MoonMark />
          <span>StatProof</span>
        </a>

        <span className={`pill${connected ? ' pill--on' : ''}`} role="status">
          <span className="pill__dot" aria-hidden="true" />
          {connected
            ? `Connected on ${networkId ?? 'preprod'}`
            : 'Wallet not connected'}
        </span>
      </header>

      <div className="layout">
        <section className="intro" aria-labelledby="intro-title">
          <h1 id="intro-title">
            Prove you clear the bar.
            <br />
            Keep your number.
          </h1>

          <p className="lede">
            Verify a private value against a public threshold without
            revealing the value.
          </p>

          <div className="observer">
            <span className="eclipse" aria-hidden="true" />

            <h2>What an observer of the chain sees</h2>

            <div className="observer__group">
              <h3>Written to Midnight</h3>
              <ul>
                <li>The threshold you choose</li>
                <li>Whether your value passed</li>
                <li>The zero-knowledge proof</li>
              </ul>
            </div>

            <div className="observer__group">
              <h3>Never leaves your browser</h3>
              <ul>
                <li>
                  <span className="redact" aria-hidden="true" />
                  <span>Your private value</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="steps">
          <section
            className="panel panel--wallet"
            data-connected={connected}
            aria-label="Wallet"
          >
            <WalletConnect
              wallet={wallet}
              connected={connected}
              address={address}
              networkId={networkId}
              isConnecting={isConnecting}
              error={error}
              onConnect={connect}
              onDisconnect={disconnect}
              onDetectWallet={detectWallet}
            />
          </section>

          <section
            className="panel panel--verify"
            data-ready={connected}
            aria-label="Private verification"
          >
            <CircuitCall
              connected={connected}
              proofProvider={proofProvider}
              providers={providers}
              contractAddress={contractAddress}
            />
          </section>
        </div>
      </div>

      <footer className="footnote">
        <p>
          Proofs are generated on your device. Only the threshold and the
          result are submitted on-chain.
        </p>
        {contract && (
          <p className="footnote__contract">
            <span>Contract</span>
            <code title={String(contractAddress)}>{contract}</code>
          </p>
        )}
      </footer>
    </div>
  );
}
