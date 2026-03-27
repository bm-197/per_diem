import { describe, it, expect } from "vitest";
import {
  transformLocations,
  transformCatalogItems,
  transformCategories,
  deduplicateById,
} from "@/lib/square-transformers";
import type { CategoryGroup } from "@/lib/types";
import type * as Square from "square";

describe("transformLocations", () => {
  it("filters to ACTIVE locations only", () => {
    const locations = [
      { id: "loc1", name: "Active Store", status: "ACTIVE", timezone: "America/New_York", address: {} },
      { id: "loc2", name: "Closed Store", status: "INACTIVE", timezone: "America/New_York", address: {} },
    ] as Square.Location[];

    const result = transformLocations(locations);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("loc1");
    expect(result[0].status).toBe("ACTIVE");
  });

  it("maps address fields correctly", () => {
    const locations = [
      {
        id: "loc1",
        name: "Test",
        status: "ACTIVE",
        timezone: "America/Chicago",
        address: {
          addressLine1: "123 Main St",
          locality: "Austin",
          administrativeDistrictLevel1: "TX",
          postalCode: "78701",
        },
      },
    ] as Square.Location[];

    const result = transformLocations(locations);
    expect(result[0].address).toEqual({
      line1: "123 Main St",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
    });
  });

  it("handles missing fields with defaults", () => {
    const locations = [
      { id: "loc1", status: "ACTIVE" },
    ] as Square.Location[];

    const result = transformLocations(locations);
    expect(result[0].name).toBe("Unnamed Location");
    expect(result[0].timezone).toBe("America/New_York");
  });
});

describe("transformCatalogItems", () => {
  const makeCatalogItem = (
    id: string,
    name: string,
    categoryId: string,
    overrides: Partial<Square.CatalogObject.Item> = {}
  ): Square.CatalogObject.Item => ({
    type: "ITEM" as const,
    id,
    presentAtAllLocations: true,
    itemData: {
      name,
      description: `${name} description`,
      categories: [{ id: categoryId }],
      imageIds: [`img-${id}`],
      variations: [
        {
          type: "ITEM_VARIATION" as const,
          id: `var-${id}`,
          itemVariationData: {
            name: "Regular",
            priceMoney: { amount: BigInt(350), currency: "USD" },
          },
        } as Square.CatalogObject.ItemVariation,
      ],
    },
    ...overrides,
  });

  const relatedObjects: Square.CatalogObject[] = [
    {
      type: "CATEGORY" as const,
      id: "cat1",
      categoryData: { name: "Coffee" },
    } as Square.CatalogObject.Category,
    {
      type: "CATEGORY" as const,
      id: "cat2",
      categoryData: { name: "Tea" },
    } as Square.CatalogObject.Category,
    {
      type: "IMAGE" as const,
      id: "img-item1",
      imageData: { url: "https://example.com/coffee.jpg" },
    } as Square.CatalogObject.Image,
  ];

  it("groups items by category", () => {
    const items = [
      makeCatalogItem("item1", "Latte", "cat1"),
      makeCatalogItem("item2", "Green Tea", "cat2"),
    ];

    const result = transformCatalogItems(items, relatedObjects, "any-loc");
    expect(result).toHaveLength(2);
    expect(result[0].category.name).toBe("Coffee");
    expect(result[1].category.name).toBe("Tea");
  });

  it("resolves category names from related objects", () => {
    const items = [makeCatalogItem("item1", "Espresso", "cat1")];
    const result = transformCatalogItems(items, relatedObjects, "any-loc");
    expect(result[0].items[0].categoryName).toBe("Coffee");
  });

  it("resolves image URLs from related objects", () => {
    const items = [makeCatalogItem("item1", "Latte", "cat1")];
    const result = transformCatalogItems(items, relatedObjects, "any-loc");
    expect(result[0].items[0].imageUrl).toBe("https://example.com/coffee.jpg");
  });

  it("returns null imageUrl when image not found", () => {
    const items = [makeCatalogItem("item99", "Mystery", "cat1")];
    const result = transformCatalogItems(items, relatedObjects, "any-loc");
    expect(result[0].items[0].imageUrl).toBeNull();
  });

  it("filters items by location (presentAtAllLocations)", () => {
    const items = [
      makeCatalogItem("item1", "Available", "cat1", { presentAtAllLocations: true }),
      makeCatalogItem("item2", "Absent", "cat1", {
        presentAtAllLocations: true,
        absentAtLocationIds: ["target-loc"],
      }),
    ];

    const result = transformCatalogItems(items, relatedObjects, "target-loc");
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].name).toBe("Available");
  });

  it("filters items by location (presentAtLocationIds)", () => {
    const items = [
      makeCatalogItem("item1", "Here", "cat1", {
        presentAtAllLocations: false,
        presentAtLocationIds: ["loc-a"],
      }),
      makeCatalogItem("item2", "NotHere", "cat1", {
        presentAtAllLocations: false,
        presentAtLocationIds: ["loc-b"],
      }),
    ];

    const result = transformCatalogItems(items, relatedObjects, "loc-a");
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].name).toBe("Here");
  });

  it("converts BigInt prices to Number", () => {
    const items = [makeCatalogItem("item1", "Latte", "cat1")];
    const result = transformCatalogItems(items, relatedObjects, "any-loc");
    const variation = result[0].items[0].variations[0];
    expect(variation.price).toBe(350);
    expect(typeof variation.price).toBe("number");
    expect(variation.formattedPrice).toBe("$3.50");
  });

  it("sorts categories and items alphabetically", () => {
    const items = [
      makeCatalogItem("item1", "Zebra Tea", "cat2"),
      makeCatalogItem("item2", "Alpha Tea", "cat2"),
      makeCatalogItem("item3", "Mocha", "cat1"),
    ];

    const result = transformCatalogItems(items, relatedObjects, "any-loc");
    expect(result[0].category.name).toBe("Coffee");
    expect(result[1].category.name).toBe("Tea");
    expect(result[1].items[0].name).toBe("Alpha Tea");
    expect(result[1].items[1].name).toBe("Zebra Tea");
  });
});

describe("transformCategories", () => {
  it("returns category summaries with item counts", () => {
    const groups: CategoryGroup[] = [
      {
        category: { id: "cat1", name: "Coffee" },
        items: [
          { id: "1", name: "Latte", description: "", categoryName: "Coffee", imageUrl: null, variations: [], modifierLists: [], availability: { status: "IN_STOCK" } },
          { id: "2", name: "Mocha", description: "", categoryName: "Coffee", imageUrl: null, variations: [], modifierLists: [], availability: { status: "IN_STOCK" } },
        ],
      },
      {
        category: { id: "cat2", name: "Tea" },
        items: [
          { id: "3", name: "Green", description: "", categoryName: "Tea", imageUrl: null, variations: [], modifierLists: [], availability: { status: "IN_STOCK" } },
        ],
      },
    ];

    const result = transformCategories(groups);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "cat1", name: "Coffee", itemCount: 2 });
    expect(result[1]).toEqual({ id: "cat2", name: "Tea", itemCount: 1 });
  });
});

describe("deduplicateById", () => {
  it("removes duplicate objects by ID", () => {
    const objects = [
      { type: "CATEGORY" as const, id: "cat1", categoryData: { name: "A" } },
      { type: "CATEGORY" as const, id: "cat1", categoryData: { name: "A" } },
      { type: "CATEGORY" as const, id: "cat2", categoryData: { name: "B" } },
    ] as Square.CatalogObject[];

    const result = deduplicateById(objects);
    expect(result).toHaveLength(2);
  });
});
