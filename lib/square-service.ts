import type * as Square from "square";
import { getSquareClient } from "./square";
import { getCached, setCache } from "./cache";
import {
  transformCatalogItems,
  transformCategories,
  deduplicateById,
} from "./square-transformers";
import type {
  CatalogResponse,
  CategoriesResponse,
  LocationResponse,
} from "./types";
import { transformLocations } from "./square-transformers";

const CACHE_TTL = 300; // 5 minutes

/** Fetch active locations with caching. */
export async function getLocations(): Promise<LocationResponse> {
  const cached = await getCached<LocationResponse>("locations");
  if (cached) return cached;

  const client = getSquareClient();
  const response = await client.locations.list();
  const locations = transformLocations(response.locations ?? []);
  const result: LocationResponse = { locations };

  await setCache("locations", result, CACHE_TTL);
  return result;
}

/**
 * Fetch inventory counts for a list of catalog object IDs at a location.
 * Returns a map of catalogObjectId → quantity.
 */
async function getInventoryCounts(
  catalogObjectIds: string[],
  locationId: string
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (catalogObjectIds.length === 0) return counts;

  const client = getSquareClient();

  try {
    const response = await client.inventory.batchGetCounts({
      catalogObjectIds,
      locationIds: [locationId],
    });

    // The response is a pageable — iterate through counts
    for await (const count of response) {
      if (count.catalogObjectId && count.state === "IN_STOCK" && count.quantity) {
        const qty = parseFloat(count.quantity);
        counts.set(count.catalogObjectId, qty);
      }
    }
  } catch {
    // If inventory API fails (e.g., not enabled), return empty — items show as available
  }

  return counts;
}

/**
 * Fetch full catalog for a location with caching.
 * Includes inventory-based availability status.
 */
export async function getFullCatalog(
  locationId: string
): Promise<CatalogResponse> {
  const cacheKey = `catalog:${locationId}`;
  const cached = await getCached<CatalogResponse>(cacheKey);
  if (cached) return cached;

  const client = getSquareClient();
  const allObjects: Square.CatalogObject[] = [];
  const allRelated: Square.CatalogObject[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.catalog.search({
      objectTypes: ["ITEM"],
      includeRelatedObjects: true,
      limit: 100,
      ...(cursor ? { cursor } : {}),
    });

    if (response.objects) allObjects.push(...response.objects);
    if (response.relatedObjects) allRelated.push(...response.relatedObjects);
    cursor = response.cursor ?? undefined;
  } while (cursor);

  const uniqueRelated = deduplicateById(allRelated);

  // Collect all variation IDs for inventory lookup
  const variationIds: string[] = [];
  for (const obj of allObjects) {
    if (obj.type === "ITEM") {
      const item = obj as Square.CatalogObject.Item;
      for (const v of item.itemData?.variations ?? []) {
        if (v.id) variationIds.push(v.id);
      }
    }
  }

  // Fetch inventory counts
  const inventoryCounts = await getInventoryCounts(variationIds, locationId);

  const categories = transformCatalogItems(allObjects, uniqueRelated, locationId, inventoryCounts);
  const result: CatalogResponse = { categories };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

/** Fetch category summaries for a location, derived from catalog data. */
export async function getCategoriesForLocation(
  locationId: string
): Promise<CategoriesResponse> {
  const cacheKey = `categories:${locationId}`;
  const cached = await getCached<CategoriesResponse>(cacheKey);
  if (cached) return cached;

  const catalog = await getFullCatalog(locationId);
  const categories = transformCategories(catalog.categories);
  const result: CategoriesResponse = { categories };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}
