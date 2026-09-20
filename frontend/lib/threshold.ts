const MAX_UINT64 = 2n ** 64n - 1n;

/**
 * Parses the public threshold typed by the user.
 * Returns null unless it is a whole number that fits in Uint<64>.
 */
export function parseThreshold(input: string): bigint | null {
  const trimmed = input.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const value = BigInt(trimmed);

  return value <= MAX_UINT64 ? value : null;
}
