# StatProof

> A privacy-preserving threshold verification dApp built on Midnight Network using Compact and zero-knowledge proofs.

StatProof allows a user to prove that a private numerical value satisfies a public threshold without revealing the private value on the public ledger.

The application connects to Midnight Preprod through Lace, generates a zero-knowledge proof, submits the verification transaction, and displays the public verification result.

---

## Live Demo

**Frontend:** [https://statproof-midnight-sable.vercel.app/](https://statproof-midnight-sable.vercel.app/)

**Network:** Midnight Preprod

The live application connects directly to the deployed StatProof contract on Midnight Preprod.
---

## Contract Address

| Network | Address |
|---|---|
| **Preview** | `ea5a3bc841861aca22a8923b972698e88fbcf6a08bea24db21e6ac3ac7f419e0` |
| **Preprod** | `63ef8b330776f30e32a3bac80f152fc609fcc2c92c744e7ce624e3c4b3f3133b` |

**Current Level 2 deployment:** Midnight Preprod

---

## What This Does

StatProof demonstrates a privacy-preserving verification workflow.

A user has a private numerical value and wants to prove that it satisfies a publicly defined threshold.

The circuit verifies:

```text
privateValue >= threshold
```

The private value is used as a witness for the zero-knowledge proof and is not stored as public contract state.

The public ledger contains verification-related information such as:

- the public threshold
- the verification result
- the number of successful proofs
- transaction and block metadata

The underlying private value is not published.

## Example

For the current demonstration:

```
Private value:    hidden
Public threshold: 80
Result:           verified
```

The frontend intentionally displays:

```
Private value: HIDDEN
```

while the proof is generated and submitted through Lace.

---

## Privacy Model

StatProof separates public contract state from private witness data.

### Public

The following information can be observed on-chain:

- threshold
- verified
- proofCount
- transaction metadata
- block metadata

### Private

The following information is not written to public contract state:

- the private numerical value
- the private witness supplied to proveThreshold
- the underlying value used to satisfy the threshold

What the user proves

The user proves:

```
privateValue >= threshold
```

without publishing:

```
privateValue
```

This is the core privacy property demonstrated by StatProof.

---

## Privacy Claim

Proved without revealing your input.

StatProof demonstrates that a private value can be used as a zero-knowledge witness for threshold verification without being written to the public ledger.

The frontend never displays the private witness as part of the verification result.

The application is a technical demonstration and should not be considered a production security or privacy guarantee.

---

## How It Works

The Level 2 frontend workflow is:

```
Connect Lace
     │
     ▼
Connect to Midnight Preprod
     │
     ▼
Select public threshold
     │
     ▼
Initialize threshold
     │
     ▼
Generate zero-knowledge proof
     │
     ▼
Sign transaction in Lace
     │
     ▼
Submit transaction to Midnight Preprod
     │
     ▼
Display verification result
```

Successful verification results in:

```
Verified on Midnight Preprod.
```

The private value remains hidden from the user interface and is not stored as public ledger state.

---

## Frontend

The Level 2 frontend is built with React and Vite.

### Main frontend structure

```
frontend/
├── components/
│   ├── WalletConnect.tsx
│   └── CircuitCall.tsx
│
├── hooks/
│   └── useMidnight.ts
│
├── lib/
│   ├── midnightProviders.ts
│   └── browserPrivateStateProvider.ts
│
├── styles/
│   └── App.css
│
├── App.tsx
├── main.tsx
└── index.html
```

### Wallet integration

The frontend supports:

- Lace wallet detection
- Lace connection
- Lace disconnection
- Midnight Preprod network validation
- wallet address display
- wallet installation errors
- rejected connection handling
- network mismatch handling
Proof workflow

### The frontend supports:

- public threshold input
- circuit invocation
- proof generation
- loading state
- Lace transaction signing
- on-chain submission
- verification result display

---

## Screenshots

### Level 2 — StatProof Frontend

![StatProof Frontend](docs/screenshots/statproof-frontend.png)

---

### Level 1 — Contract Compilation

![Contract Compilation](docs/screenshots/compile-success.png)

### Level 1 — Preview Deployment

![Preview Deployment](docs/screenshots/preview-contract.png)

### Level 1 — Zero-Knowledge Threshold Proof

![Zero-Knowledge Threshold Proof](docs/screenshots/zk-proof-success.png)

### Level 1 — Public Ledger State

![Public Ledger State](docs/screenshots/public-state.png)
---

## Tech Stack

Blockchain

- Midnight Network
- Compact
- Midnight Preprod
- Zero-Knowledge Proofs

Frontend

- React
- Vite
- TypeScript
- Lace Wallet
- Midnight dApp Connector API
- Midnight.js

Backend / Development

- Node.js 22+
- npm
- Docker / Docker Compose
- Midnight Proof Server
- Midnight Indexer
- Midnight Wallet SDK

---

## Current Dependency Versions

| Package | Version |
|---|---:|
| `@midnight-ntwrk/compact-runtime` | `0.16.0` |
| `@midnight-ntwrk/midnight-js-contracts` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-http-client-proof-provider` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-indexer-public-data-provider` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-level-private-state-provider` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-network-id` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-node-zk-config-provider` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-protocol` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-types` | `4.1.1` |
| `@midnight-ntwrk/midnight-js-utils` | `4.1.1` |
| `@midnight-ntwrk/dapp-connector-api` | `4.0.1` |
| `@midnight-ntwrk/wallet-sdk` | `1.2.0` |
| React | `19.x` |
| Vite | `8.x` |
| TypeScript | `6.0.3` |
| Node.js | `22+` |

---

## Prerequisites

Before running StatProof locally, install:

### Node.js

Node.js 22 or later is required.

Verify:

```
node --version
```

### Docker

Docker must be installed and running.

Verify:

```
docker --version
docker compose version
```

### Compact

The Compact compiler must be available through the `compact` CLI.

Verify:

```
compact --version
```

### Lace

Install the Lace wallet and configure it for Midnight Preprod.

The application requires Lace to:

- connect the wallet
- sign transactions
- submit transactions to Midnight Preprod

---

## Run Locally

Clone the repository:

```
git clone https://github.com/isinsuatay/statproof-midnight.git
cd statproof-midnight
```

Install dependencies:

```
npm install
```

Compile the Compact contract:

```
npm run compile
```

Start the frontend:
```
npm run dev
```

The Vite development server will provide a local URL, typically:
```
http://localhost:5173
```

Open the URL in a browser with Lace installed.

---

Using the Application

1. Connect Lace

Open the StatProof frontend and click the wallet connection button.

The application verifies that the wallet is connected to:
```
preprod
```

2. Choose a threshold

Enter a public threshold.

For example:

```
80
```

3. Start verification

Click:

```
Verify Privately
```

The application prepares the transaction and generates the zero-knowledge proof.

4. Sign in Lace

Lace displays the transaction that is about to be signed.

Review the transaction and approve it.

5. Wait for proof generation and submission

The frontend displays:

```
Generating zero-knowledge proof...
```

6. View the result

After successful submission:

```
Verified on Midnight Preprod.
```

The frontend continues to display:

```
Private value: HIDDEN
```

---

## Contract Design

The Compact contract contains two primary circuits.

`initialize``

Initializes or updates the public threshold.

Conceptually:

```
initialize(threshold)
```

The threshold becomes public ledger state.

`proveThreshold``

Evaluates the private witness against the public threshold.

Conceptually:

```
proveThreshold()
```

The circuit verifies:

```
privateValue >= threshold
```

If the condition is satisfied, the public verification state is updated.

If the condition is not satisfied, the transaction fails rather than publishing the private value.

---

## Public Ledger State

After a successful verification, the public contract state contains information such as:

```
threshold: 80
verified: true
proofCount: 1
```

The private value is not stored as public contract state.

Private value: NOT stored on public ledger

---

## Zero-Knowledge Workflow

The complete workflow is:

```
1. Connect Lace wallet
        │
        ▼
2. Connect to StatProof Preprod contract
        │
        ▼
3. Set public threshold
        │
        ▼
4. Use private witness
        │
        ▼
5. Generate zero-knowledge proof
        │
        ▼
6. Sign transaction with Lace
        │
        ▼
7. Submit transaction
        │
        ▼
8. Read verification result
```

The sensitive input does not need to become public ledger state.

---

## Build / Type Checking

Run:

```
npm run build
```

The project should complete the TypeScript validation successfully.

---

## Run Tests

Run:

```
npm test
```

The test suite covers:

1. Successful threshold verification.
2. Failed threshold verification.
3. Public/private state separation.

---

## Network Configuration

StatProof supports:

| Network | Purpose |
|---|---|
| `undeployed` | Local development |
| `preview` | Midnight Preview test network |
| `preprod` | Midnight Preprod test network |


The Level 2 frontend is configured for:

```
preprod
```
The active network can be changed for the CLI with:

```
npm run network preview
```

or:

```
npm run network preprod
```
---

### Security and Privacy Considerations

StatProof is a demonstration of privacy-preserving verification rather than a production financial application.

### Private witness handling

The private value should never be committed to source control or exposed through public configuration in a production implementation.

The current demonstration uses a fixed witness for reproducibility.

### Wallet security

Never commit:

- wallet recovery phrases
- seed phrases
- private keys
- wallet state
- deployment secrets

### Testnet status

The current Level 2 contract is deployed to Midnight Preprod testnet.

No production or mainnet value should be considered secure or final based solely on this demonstration.

---

## Available Commands

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run compile` | Compile the Compact contract |
| `npm run build` | Run TypeScript validation |
| `npm test` | Run the test suite |
| `npm run setup` | Run project setup |
| `npm run deploy` | Deploy the contract |
| `npm run cli` | Launch the interactive CLI |
| `npm run check-balance` | Check wallet balances |
| `npm run network` | Display active network |
| `npm run network preview` | Switch to Preview |
| `npm run network preprod` | Switch to Preprod |
| `npm run test:e2e` | Run end-to-end connectivity check |
| `npm run proof-server:start` | Start local proof server |
| `npm run proof-server:stop` | Stop local proof server |
| `npm run clean` | Remove generated deployment/runtime state |
| `npm run dev` | Start the Vite frontend |
| `npm run frontend:build` | Build the frontend |

---

## Level 2 — Midnight Builder Challenge Checklist

| Requirement | Status |
|---|---|
| Lace wallet connect | ✅ Complete |
| Lace wallet disconnect | ✅ Complete |
| Connected / disconnected states | ✅ Complete |
| Preprod network validation | ✅ Complete |
| Wallet address display | ✅ Complete |
| Frontend circuit call | ✅ Complete |
| Zero-knowledge proof generation | ✅ Complete |
| Loading state | ✅ Complete |
| Lace transaction signing | ✅ Complete |
| On-chain verification result | ✅ Complete |
| Private value hidden from UI | ✅ Complete |
| Privacy claim displayed | ✅ Complete |
| Preprod contract address documented | ✅ Complete |
| Frontend design | ✅ Complete |
| Live Vercel deployment | ✅ Complete |
| Live demo URL | ✅ Complete |
| Demo video | ✅ Complete |
| 8 meaningful commits | ✅ Complete |
| GitHub + live link submission | ✅ Complete |

---

## Demo Video

Demo video:

TBD

The final demonstration will show:

1. Opening the StatProof frontend.
2. Connecting Lace.
3. Showing the Preprod network.
4. Entering a public threshold.
5. Starting private verification.
6. Generating the zero-knowledge proof.
7. Approving the transaction in Lace.
8. Displaying the successful verification result.
9. Demonstrating that the private value remains hidden.
The final demo is intended to be under two minutes.

---

## Project Structure

```
statproof-midnight/

├── contracts/
│   ├── statproof.compact
│   └── managed/
│       └── statproof/
│
├── frontend/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   └── CircuitCall.tsx
│   │
│   ├── hooks/
│   │   └── useMidnight.ts
│   │
│   ├── lib/
│   │   ├── midnightProviders.ts
│   │   └── browserPrivateStateProvider.ts
│   │
│   ├── styles/
│   │   └── App.css
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.html
│
├── scripts/
│   └── e2e-check.ts
│
├── src/
│   ├── network.ts
│   ├── wallet.ts
│   ├── wallet-state.ts
│   ├── setup.ts
│   ├── deploy.ts
│   ├── cli.ts
│   └── check-balance.ts
│
├── tests/
│   └── statproof.test.ts
│
├── docs/
│   └── screenshots/
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

Generated and local runtime directories are intentionally excluded from version control.

---

## Roadmap

### Level 1 — New Moon

Complete

- Compact contract
- Private threshold verification
- Zero-knowledge circuit
- Preview deployment
- Contract tests
- Public/private state separation

### Level 2 — Waxing Crescent

Complete / Submission Preparation

- Browser frontend
- React + Vite integration
- Lace wallet connection
- Midnight Preprod integration
- Frontend circuit invocation
- Zero-knowledge proof generation
- Transaction signing
- Verification result display
- Privacy-focused UX

###Level 3 — First Quarter

- Production-grade dApp architecture
- Stronger automated testing
- Improved error handling
- Better contract interaction abstractions
- Production-oriented privacy UX

### Level 4 — Waxing Gibbous

- Public-facing MVP
- Broader UX improvements
- Production-ready documentation
- Real-world use-case validation

### Level 5 — Full Moon

- Public user testing
- User feedback
- Structured feedback collection
- Iterative UX improvements

### Level 6 — Supermoon

- Mainnet deployment
- Production security review
- Operational monitoring
- Final release

---

## Challenge Submission

StatProof was developed as part of the Midnight Builder Challenge.

The Level 2 implementation extends the Level 1 privacy-preserving contract with a browser-based frontend and Lace wallet integration.

The final Level 2 flow is:

```
Public Threshold
       +
Private Witness
       ↓
Zero-Knowledge Proof
       ↓
Lace Transaction
       ↓
Midnight Preprod
       ↓
Public Verification Result
```

The underlying private value remains outside the public ledger state.

---

## License
This project is licensed under the MIT License.
