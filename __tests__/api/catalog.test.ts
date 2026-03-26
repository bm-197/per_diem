import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/square-service", () => ({
  getFullCatalog: vi.fn(),
}));

vi.mock("@/lib/api-utils", () => ({
  withLogging: (handler: Function) => handler,
}));

import { GET } from "@/app/api/catalog/route";
import { getFullCatalog } from "@/lib/square-service";
import { NextRequest } from "next/server";

const mockedGetFullCatalog = vi.mocked(getFullCatalog);

function makeRequest(url: string) {
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/catalog", () => {
  it("returns 400 when location_id is missing", async () => {
    const response = await GET(makeRequest("http://localhost:3000/api/catalog"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("MISSING_PARAM");
  });

  it("returns catalog data on success", async () => {
    mockedGetFullCatalog.mockResolvedValue({
      categories: [
        {
          category: { id: "cat1", name: "Coffee" },
          items: [
            {
              id: "item1",
              name: "Latte",
              description: "Smooth latte",
              categoryName: "Coffee",
              imageUrl: "https://example.com/latte.jpg",
              variations: [
                { id: "v1", name: "Regular", price: 450, formattedPrice: "$4.50", currency: "USD" },
              ],
            },
          ],
        },
      ],
    });

    const response = await GET(
      makeRequest("http://localhost:3000/api/catalog?location_id=loc1")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.categories).toHaveLength(1);
    expect(data.categories[0].category.name).toBe("Coffee");
    expect(data.categories[0].items[0].name).toBe("Latte");
  });

  it("returns error response on failure", async () => {
    mockedGetFullCatalog.mockRejectedValue(
      Object.assign(new Error(), {
        statusCode: 401,
        body: {
          errors: [{ detail: "Unauthorized", code: "UNAUTHORIZED", category: "AUTHENTICATION_ERROR" }],
        },
      })
    );

    const response = await GET(
      makeRequest("http://localhost:3000/api/catalog?location_id=loc1")
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(data.code).toBe("UNAUTHORIZED");
  });
});
