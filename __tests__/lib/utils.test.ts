import { describe, it, expect } from "vitest";
import { formatPrice, truncateText, serializeBigInt } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats cents to dollars", () => {
    expect(formatPrice(1250)).toBe("$12.50");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats single dollar", () => {
    expect(formatPrice(100)).toBe("$1.00");
  });

  it("handles BigInt input", () => {
    expect(formatPrice(BigInt(450))).toBe("$4.50");
  });

  it("respects currency parameter", () => {
    const result = formatPrice(1000, "EUR");
    expect(result).toContain("10");
  });
});

describe("truncateText", () => {
  it("returns short text unchanged", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("truncates long text with ellipsis", () => {
    expect(truncateText("a very long description here", 10)).toBe("a very lon...");
  });

  it("handles exact length", () => {
    expect(truncateText("12345", 5)).toBe("12345");
  });

  it("handles empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });
});

describe("serializeBigInt", () => {
  it("converts BigInt to Number", () => {
    expect(serializeBigInt(BigInt(150))).toBe(150);
  });

  it("handles nested objects with BigInt", () => {
    const input = { price: { amount: BigInt(1250), currency: "USD" } };
    const result = serializeBigInt(input);
    expect(result).toEqual({ price: { amount: 1250, currency: "USD" } });
  });

  it("handles arrays with BigInt", () => {
    const input = [BigInt(1), BigInt(2), BigInt(3)];
    expect(serializeBigInt(input)).toEqual([1, 2, 3]);
  });

  it("passes through null and undefined", () => {
    expect(serializeBigInt(null)).toBeNull();
    expect(serializeBigInt(undefined)).toBeUndefined();
  });

  it("passes through strings and numbers", () => {
    expect(serializeBigInt("hello")).toBe("hello");
    expect(serializeBigInt(42)).toBe(42);
  });
});
