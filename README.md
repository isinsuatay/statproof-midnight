# StatProof

> A privacy-preserving threshold verification application built on Midnight Network using Compact and zero-knowledge proofs.

StatProof demonstrates how a private numerical value can be verified against a publicly defined threshold without revealing the private value on the public ledger.

The application stores only the verification result and related public metadata on-chain. The underlying private witness remains private while a zero-knowledge proof demonstrates that the private value satisfies the public requirement.

---

## Contract Address

| Network | Address |
|---|---|
| **Preview** | `ea5a3bc841861aca22a8923b972698e88fbcf6a08bea24db21e6ac3ac7f419e0` |
| **Preprod** | `TBD — not deployed yet` |

> **Current deployment:** StatProof is deployed and verified on the Midnight Preview network.

---

## What This Does

StatProof implements a simple but representative privacy-preserving verification workflow.

A user possesses a private numerical value. A public threshold is defined on the contract. The application then generates a zero-knowledge proof demonstrating whether:

```text
privateValue >= publicThreshold
```

The important property is that the private value itself does not need to be published.

### Example

In the current Preview deployment:

```
Private value:       85
Public threshold:    80
Verification result: true
```

The public ledger records the threshold and verification result, but does not store the value 85 as public contract state.

The same workflow also demonstrates the failure case:
```
Private value:       85
Public threshold:    100
Verification result: false
```

This means a verifier can establish whether the private condition was satisfied without learning the underlying private value.

---

## Privacy Model

StatProof deliberately separates public contract state from private witness data.

### Public

The following information is stored as public ledger state:

- threshold — the public value against which the private witness is evaluated.
- verified — whether the most recent threshold proof was accepted.
- proofCount — the number of successful threshold proofs.
- Transaction and block metadata associated with on-chain operations.

### Private

The following information remains private:

- The user's private numerical value.
- The private witness supplied to the proveThreshold circuit.
- The underlying value used to satisfy the threshold condition.

The private value is not written to the public ledger.

### What the user proves

The user proves the statement:

```
privateValue >= threshold
```

without disclosing:

```
privateValue
```

This is the core privacy property demonstrated by the project.

---

### Why This Matters

Many real-world applications require proving that a condition is satisfied without revealing the underlying sensitive data.

For example:

- Proving that a financial balance exceeds a required minimum.
- Proving that an age requirement is satisfied.
- Proving that a credit score exceeds a threshold.
- Proving eligibility for a service.
- Proving that a private measurement satisfies a regulatory requirement.
- Proving membership in a range without exposing the exact value.

StatProof is intentionally small, but its architecture demonstrates the fundamental pattern:

```
Private Data
     │
     ▼
Zero-Knowledge Circuit
     │
     │ proves:
     │ privateValue >= threshold
     ▼
Public Verification Result
     │
     ├── threshold
     ├── verified
     └── proofCount
```

The sensitive input does not need to become public state.

---

## Contract Design

The Compact contract contains two primary circuits.

`initialize`

Initializes or updates the public threshold.

Conceptually:

```
initialize(threshold)
```

The threshold becomes part of the public ledger state.

`proveThreshold`

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

After successfully proving a private value of 85 against a public threshold of 80, the Preview deployment 

reports:

```
threshold: 80
verified: true
proofCount: 1
```

The application explicitly reports:

```
Private value: NOT stored on public ledger
```

This provides a direct demonstration of the intended public/private separation.

---

## Zero-Knowledge Workflow

The complete application workflow is:

```
1. Connect wallet
       │
       ▼
2. Connect to deployed StatProof contract
       │
       ▼
3. Initialize public threshold
       │
       ▼
4. Provide private witness
       │
       ▼
5. Generate zero-knowledge proof
       │
       ▼
6. Submit transaction
       │
       ▼
7. Update public verification state
       │
       ▼
8. Read public ledger state
```

At no point does the application need to publish the underlying private witness as public ledger state.

---

## Tech Stack

- Midnight Network
- Compact
- Midnight.js
- Zero-Knowledge Proofs
- Node.js 22+
- TypeScript
- tsx
- Docker / Docker Compose
- Midnight Proof Server
- Midnight Indexer
- Midnight Wallet SDK
- npm

### Current dependency versions

The project currently uses:

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
| `@midnight-ntwrk/onchain-runtime-v3` | `3.0.0` |
| `@midnight-ntwrk/wallet-sdk` | `1.2.0` |
| `TypeScript` | `6.0.3` |
| `tsx` | `4.23.12` |
| `Node.js` | `22+` |

---

## Prerequisites

Before running the project locally, install:

### Node.js

Node.js version 22 or later is required.

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

### Compact Compiler

The Compact compiler must be available through the compact CLI.

Verify:

```
compact --version
```

### Installation

Clone the repository and install dependencies:

```
git clone <YOUR_PUBLIC_GITHUB_REPOSITORY_URL>
cd my-midnight-app
npm install
```

### Compile the Contract

The StatProof Compact contract can be compiled with:

```
npm run compile
```

The current contract contains two circuits:

```
initialize
proveThreshold
```

A successful compilation produces the generated contract artifacts under:

```
contracts/managed/statproof/
```

The generated artifacts include circuit and zero-knowledge proving assets required by the Midnight.js 
application.

### Expected compilation output

```
Compiling 2 circuits:
  circuit "initialize" (k=7, rows=90)
  circuit "proveThreshold" (k=9, rows=189)
```

Generated contract artifacts are intentionally excluded from Git because they are build outputs.

---

## Build / Type Checking

Run the TypeScript build check with:

```
npm run build
```

The project currently completes the TypeScript check successfully.

---

## Run Tests

Run the test suite with:

```
npm test
```

Current test suite:

```
✔ private value satisfies threshold when value >= threshold
✔ private value does not satisfy threshold when value < threshold
✔ private value is not part of the public ledger state

ℹ tests 3
ℹ pass 3
ℹ fail 0
```

The tests cover:

1. Successful threshold verification.
2. Failed threshold verification.
3. The public/private state separation used by the application.

---

## Test Strategy

The Level 1 test suite intentionally focuses on the core privacy-preserving behavior.

### Test 1 — Successful verification

Verifies that a private value satisfying the threshold is accepted.

Example:
```
85 >= 80
```

Expected:

```
true
```

### Test 2 — Failed verification

Verifies that a private value below the threshold does not satisfy the requirement.

Example:

```
85 >= 100
```

Expected:

```
false
```

### Test 3 — Private state protection

Verifies that the private witness is not represented as part of the public ledger state.

The public state is limited to verification-related information such as:

```
threshold
verified
proofCount
```

---

## Running the CLI

The project includes an interactive CLI:

```
npm run cli
```

The CLI provides:

```
1. Initialize threshold
2. Prove private value ≥ threshold
3. Read public contract state
4. Check wallet balance
5. Exit
```

Example successful workflow

Initialize a public threshold:

```
Your choice: 1
Enter public threshold: 80
```

Then prove the private value satisfies the threshold:

```
Your choice: 2
```

The current demonstration uses:

```
Private witness value: 85
```

The resulting transaction is accepted because:

```
85 >= 80
```

The public state can then be inspected:

```
Your choice: 3
```

Expected state:

```
Public Ledger State
threshold: 80
verified: true
proofCount: 1

Private value: NOT stored on public ledger
```
---

## Network Configuration

The application supports multiple Midnight environments:

| Network | Purpose |
|---|---|
| `undeployed` | Local development environment |
| `preview` | Public Preview test network |
| `preprod` | Public Preprod test network |


The current deployed StatProof contract is running on:

```
preview
```

The active network can be changed with:

```
npm run network preview
```
or:

```
npm run network preprod
```

---

## Preview Deployment

The current StatProof deployment is available on the Midnight Preview network.
Contract:

```
ea5a3bc841861aca22a8923b972698e88fbcf6a08bea24db21e6ac3ac7f419e0
```

The deployment has been exercised through the CLI and successfully demonstrated:

- Wallet synchronization.
- Contract connection.
- Public threshold initialization.
- Zero-knowledge threshold verification.
- Public ledger state retrieval.
- Successful verification state update.

---

## Project Structure

```
my-midnight-app/
│
├── contracts/
│   ├── hello-world.compact
│   ├── statproof.compact
│   └── managed/
│       └── statproof/
│           ├── compiler/
│           ├── contract/
│           ├── keys/
│           └── zkir/
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
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

Important generated/private directories

The following are intentionally excluded from version control:

```
node_modules/
contracts/managed/
.midnight-state.json
.midnight-wallet-state/
midnight-level-db/
```

These files may contain generated artifacts, runtime state, wallet synchronization data, or deployment-specific information and should not be committed to the public repository.

---

## Available Commands

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run compile` | Compile the StatProof Compact contract |
| `npm run build` | Run TypeScript validation |
| `npm test` | Run the unit test suite |
| `npm run setup` | Run the project setup workflow |
| `npm run deploy` | Deploy the compiled contract |
| `npm run cli` | Launch the interactive StatProof CLI |
| `npm run check-balance` | Check wallet balances |
| `npm run network` | Display the active network |
| `npm run network preview` | Switch to Preview |
| `npm run network preprod` | Switch to Preprod |
| `npm run test:e2e` | Run the end-to-end connectivity check |
| `npm run proof-server:start` | Start the local proof server |
| `npm run proof-server:stop` | Stop the local proof server |
| `npm run clean` | Remove generated deployment/runtime state |

---

## Security and Privacy Considerations

StatProof is designed as a demonstration of privacy-preserving verification rather than a production financial application.

Important considerations include:

### Private witness handling

The private value must remain private and should never be hard-coded into publicly shared configuration or committed to source control in a real deployment.

The current demonstration uses a fixed private witness value for reproducibility.

### Wallet security

Wallet recovery phrases, seeds, private keys, and wallet state must never be committed to Git.
The repository's `.gitignore` excludes local wallet and deployment state.

### Generated artifacts

Compiled contract artifacts are generated locally and are not treated as source code.
They should be regenerated using:

```
npm run compile
```

### Testnet status

The current contract is deployed to Midnight Preview testnet.
No production/mainnet value should be considered secure or final based solely on this demonstration.

---

## Initial Idea

### Privacy-Preserving Threshold Verification

The initial idea behind StatProof was to build a small application demonstrating one of the most useful practical applications of zero-knowledge technology:

- Prove that a private value satisfies a public requirement without revealing the value itself.

Traditional verification systems often require users to disclose the underlying information.

For example, a service may need to know whether a user satisfies a minimum balance, age, score, or eligibility threshold. A conventional implementation would typically require the user to submit the actual value.

StatProof explores a different model.

Instead of publishing:

```
Private value = 85
```
the application proves:

```
Private value >= 80
```
while keeping the underlying value private.

The project was intentionally designed as a minimal implementation so that the privacy boundary between public ledger state and private witness data is easy to understand and verify.

This pattern can be extended to more complex use cases such as private financial eligibility, credential verification, compliance checks, reputation systems, and other applications where revealing the underlying data is unnecessary.

## Screenshots

### 1. Contract Compilation

The Compact contract successfully compiles into two circuits:

- `initialize`
- `proveThreshold`

![StatProof contract compilation](docs/screenshots/compile-success.png)

---

### 2. Preview Deployment

The application successfully connects to the deployed StatProof contract on Midnight Preview.

![StatProof Preview deployment](docs/screenshots/preview-contract.png)

---

### 3. Zero-Knowledge Threshold Proof

The application successfully proves that the private witness value `85` satisfies the public threshold `80`.

![Successful zero-knowledge threshold proof](docs/screenshots/zk-proof-success.png)

---

### 4. Public Ledger State

The resulting public state shows the threshold and verification result while explicitly demonstrating that the private value is not stored on the public ledger.

![StatProof public ledger state](docs/screenshots/public-state.png)

---

## Level 1 — Midnight Builder Challenge Checklist

| Requirement | Status |
|---|---|
| Contract compiles with `compact compile` | ✅ Complete |
| `managed/` directory generated | ✅ Complete |
| 3+ tests passing | ✅ Complete — 3 tests |
| Contract deployed to Preview or Preprod | ✅ Complete — Preview |
| Contract address visible in README | ✅ Complete |
| README contains all required sections | ✅ Complete |
| File structure follows the challenge requirements | ✅ Complete |
| Public/private privacy model demonstrated | ✅ Complete |
| Zero-knowledge threshold proof demonstrated | ✅ Complete |
| Screenshots documented | ✅ Complete |
| Meaningful Git commits | ✅ Complete |

---

## Current Verification Evidence

The current implementation has been verified through the following successful operations:

```
npm run compile
```

Result:

```
Compiling 2 circuits:
  circuit "initialize" (k=7, rows=90)
  circuit "proveThreshold" (k=9, rows=189)
```

Tests:

```
npm test
```

Result:

```
3 tests
3 passed
0 failed
```

TypeScript validation:

```
npm run build
```

Result:

```
completed successfully
```

Preview contract interaction:

```
threshold: 80
verified: true
proofCount: 1
```


Privacy confirmation:

```
Private value: NOT stored on public ledger
```

---

## Roadmap

The Level 1 implementation establishes the privacy-preserving contract foundation.

Potential future iterations can extend the project with:

### Level 2 — Frontend Integration

- Browser-based interface.
- Wallet connection.
- User-friendly threshold configuration.
- Proof generation workflow.
- Public verification result display.

### Level 3 — Production-Grade dApp

- Stronger automated testing.
- CI/CD.
- Better error handling.
- Contract interaction abstractions.
- Improved privacy UX.
- Production-oriented architecture.

### Level 4 — MVP

- Public-facing application.
- Improved user experience.
- Preprod deployment.
- Application documentation.
- Real-world use-case validation.

### Level 5 — User Feedback

- Public Preprod link.
- Real user testing.
- Structured feedback collection.
- Iterative UX improvements.

### Level 6 — Mainnet

- Mainnet deployment.
- Production security review.
- Operational monitoring.
- Final release.

---

## License
This project is licensed under the MIT License.

---

## Challenge Submission

This repository was developed as part of the Midnight Builder Challenge and demonstrates a privacy-preserving smart contract built with Midnight Network and Compact.

The Level 1 implementation focuses on:

```
Public threshold
       +
Private witness
       ↓
Zero-knowledge proof
       ↓
Public verification result
```

The underlying private value remains outside the public ledger state.
