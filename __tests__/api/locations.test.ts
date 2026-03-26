import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies before importing the route
vi.mock("@/lib/square-service", () => ({
  getLocations: vi.fn(),
}));

vi.mock("@/lib/api-utils", () => ({
  withLogging: (handler: Function) => handler,
}));

import { GET } from "@/app/api/locations/route";
import { getLocations } from "@/lib/square-service";
import { NextRequest } from "next/server";

const mockedGetLocations = vi.mocked(getLocations);

function makeRequest(url: string = "http://localhost:3000/api/locations") {
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/locations", () => {
  it("returns locations on success", async () => {
    mockedGetLocations.mockResolvedValue({
      locations: [
        {
          id: "loc1",
          name: "Test Location",
          address: { line1: "123 Main St", city: "Austin", state: "TX", postalCode: "78701" },
          timezone: "America/Chicago",
          status: "ACTIVE",
        },
      ],
    });

    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locations).toHaveLength(1);
    expect(data.locations[0].name).toBe("Test Location");
    expect(data.locations[0].status).toBe("ACTIVE");
  });

  it("returns error response on failure", async () => {
    mockedGetLocations.mockRejectedValue(new Error("Network error"));

    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Network error");
    expect(data.code).toBe("INTERNAL_ERROR");
  });
});
