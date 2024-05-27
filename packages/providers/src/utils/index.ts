// == Numbers ==

export function calculateAmount(amount: string): number {
  return Math.floor(Number(amount) * 10 ** 9);
}

export function smallAddress(address: string): string {
  return `${address.slice(0, 8)}…${address.slice(-8)}`;
}

// == Balances ==

export function bigintDivision(a: bigint, b: bigint, precision = 8n): number {
  if (b === 0n) return NaN;
  const base = 10n ** precision;
  const baseNum = Number(base);
  return Number((a * base) / b) / baseNum;
}

export function fromNano(nano: number | bigint): number {
  if (typeof nano === "bigint") return bigintDivision(nano, 1_000_000_000n);
  return nano / 1_000_000_000;
}

export function formatToken(nano: number | bigint): string {
  const amount = fromNano(nano);
  return amount.toFixed(2);
}
