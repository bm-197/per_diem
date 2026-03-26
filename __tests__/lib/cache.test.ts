import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGet, mockSet, mockDel, mockScan } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
  mockDel: vi.fn(),
  mockScan: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({
      get: mockGet,
      set: mockSet,
      del: mockDel,
      scan: mockScan,
    }),
  },
}));

import { getCached, setCache, deleteCache, invalidateCache } from "@/lib/cache";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCached", () => {
  it("returns cached data on hit", async () => {
    mockGet.mockResolvedValue({ locations: [] });
    const result = await getCached("locations");
    expect(result).toEqual({ locations: [] });
    expect(mockGet).toHaveBeenCalledWith("locations");
  });

  it("returns null on cache miss", async () => {
    mockGet.mockResolvedValue(null);
    const result = await getCached("missing");
    expect(result).toBeNull();
  });
});

describe("setCache", () => {
  it("stores value with default TTL", async () => {
    await setCache("locations", { locations: [] });
    expect(mockSet).toHaveBeenCalledWith(
      "locations",
      { locations: [] },
      { ex: 300 }
    );
  });

  it("stores value with custom TTL", async () => {
    await setCache("key", "value", 60);
    expect(mockSet).toHaveBeenCalledWith("key", "value", { ex: 60 });
  });
});

describe("deleteCache", () => {
  it("deletes a single key", async () => {
    await deleteCache("locations");
    expect(mockDel).toHaveBeenCalledWith("locations");
  });
});

describe("invalidateCache", () => {
  it("scans and deletes matching keys", async () => {
    mockScan.mockResolvedValueOnce(["0", ["catalog:loc1", "catalog:loc2"]]);
    await invalidateCache("catalog:*");
    expect(mockScan).toHaveBeenCalledWith("0", { match: "catalog:*" });
    expect(mockDel).toHaveBeenCalledWith("catalog:loc1", "catalog:loc2");
  });

  it("does nothing when no keys match", async () => {
    mockScan.mockResolvedValueOnce(["0", []]);
    await invalidateCache("nonexistent:*");
    expect(mockDel).not.toHaveBeenCalled();
  });
});
