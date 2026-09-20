# Product Proposal

## What is the product, and who uses it?

StatProof Feedback is anonymous, verified feedback for a cohort: a university course, a bootcamp, a hackathon or a developer community. An organizer registers the members. A member can rate the cohort only if they actually took part (for example, a private attendance or participation value above a public minimum), and only once. Nobody, including the organizer, can tell who gave which rating.

Users:
- Participants who want to give honest feedback without fear of retaliation.
- Instructors and organizers who want feedback they can trust, not spam or drive-by reviews.

Today both options fail: named forms make people self-censor, and open anonymous forms accept anyone and can be flooded.

## Why Midnight specifically?

On a transparent chain, a review would expose the reviewer's wallet, their attendance value and the link between them, and a Merkle path or nullifier would show exactly which member acted. A centralized form tool asks everyone to trust its operator with identities and raw data.

Midnight lets a member prove, in zero knowledge, three things at once: "I am in the cohort", "my private attendance or participation value is at least the public minimum" (the threshold proof StatProof already implements), and "I have not rated before" (a nullifier). Only the rating and the nullifier become public. The private value and the member's identity stay on the member's device.

## Data Model

| Data Point | Type | Disclosed To |
|------------|------|--------------|
| Eligibility minimum (threshold) | Public ledger | Everyone |
| Member commitments (hash of secret, attribute and cohort id) | Public ledger (Merkle tree) | Everyone; reveal nothing without the secret |
| Rating counters (1 to 5) | Public ledger | Everyone |
| Review nullifiers | Public ledger | Everyone; not linkable to a member |
| Member secret key | Private witness | Only the member |
| Attendance or participation value | Private witness | The member and the organizer who attested it |
| Member identity to commitment mapping | Off-chain | Only the organizer |

## Mainnet Feasibility

Feasible as a staged build. Level 4 MVP: one cohort, organizer-registered commitments, and one circuit that checks membership, the threshold and a nullifier, then increments a rating counter. The building blocks (Merkle membership with a historic tree, hashed nullifiers) are documented in Midnight community tutorials, and I will follow that pattern, including binding the Merkle path's leaf to the recomputed commitment and testing it with a forged-path test.

Known risks, to be addressed or documented honestly:
- **Organizer trust:** the organizer attests attribute values and knows which identity registered which commitment. Anonymity holds for everyone else and for ratings; the truthfulness of the attribute depends on the organizer.
- **Wallet-level linkability:** whether the wallet that submits a transaction can be linked to the rating it changes must be checked against Midnight's transaction model. If it can, ratings will use a commit-then-reveal flow instead of immediate tallies.
- **Small cohorts:** small groups weaken anonymity. The app will show the cohort size and recommend a minimum.
- **Current contract:** the Level 3 StatProof contract lets anyone call `initialize`, which resets the counters. The new contract will store an organizer key and enforce it.
- **Mainnet:** Preprod is the realistic baseline for Level 6. Mainnet only after a security review of the circuits and confirming the Level 6 definition on Rise In.
