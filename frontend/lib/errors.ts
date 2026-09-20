export type ErrorContext = 'connect' | 'verify';

const PROOF_SERVER_URL = 'http://localhost:6300';

function extractText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  if (error && typeof error === 'object') {
    const { message, reason, code } = error as Record<string, unknown>;

    return [message, reason, code]
      .filter((part): part is string => typeof part === 'string' && part.length > 0)
      .join(' ');
  }

  return '';
}

/**
 * Turns wallet, network and circuit errors into messages a non-technical
 * user can act on. Never includes anything about the private witness.
 */
export function describeError(
  error: unknown,
  context: ErrorContext = 'verify',
): string {
  const raw = extractText(error).trim();
  const text = raw.toLowerCase();

  if (text.includes('does not satisfy the threshold')) {
    return 'Your private value does not satisfy this threshold, so no proof was generated. Nothing about your value was revealed. Try a lower threshold.';
  }

  if (text.includes('wrong network')) {
    return raw;
  }

  if (/reject|denied|declined|cancel/.test(text)) {
    return context === 'connect'
      ? 'The connection request was rejected in Lace. Click "Connect Lace" to try again.'
      : 'The request was rejected in Lace. Nothing was submitted.';
  }

  if (
    /failed to fetch|networkerror|load failed|econnrefused|network request failed/.test(
      text,
    )
  ) {
    return `A network request failed. If you are using the live demo, make sure the local proof server is running at ${PROOF_SERVER_URL} (Docker must be running; see the README) and that you are online, then try again.`;
  }

  if (/insufficient|not enough|\bfunds?\b|\bdust\b/.test(text)) {
    return 'Your wallet may not have enough funds to pay the transaction fee. Fund it from the Preprod faucet and try again.';
  }

  if (!raw) {
    return context === 'connect'
      ? 'Wallet connection failed. Please try again.'
      : 'Verification failed. Please try again.';
  }

  return raw.length > 240 ? `${raw.slice(0, 240)}…` : raw;
}
