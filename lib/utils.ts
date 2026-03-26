/**
 * Format a price in the smallest currency unit (cents) to a display string.
 * @example formatPrice(1250) → "$12.50"
 * @example formatPrice(0) → "$0.00"
 */
export function formatPrice(
  amountInCents: number | bigint,
  currency: string = "USD"
): string {
  const cents = Number(amountInCents);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/**
 * Truncate text to a maximum length, appending "..." if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Recursively convert BigInt values to Number for JSON serialization.
 * Square SDK returns BigInt for monetary amounts which breaks JSON.stringify.
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return Number(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(serializeBigInt) as unknown as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result as T;
  }
  return obj;
}
