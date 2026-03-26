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
 * Fetch full catalog for a location with caching.
 * Handles pagination and deduplication of related objects.
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
  const categories = transformCatalogItems(allObjects, uniqueRelated, locationId);
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
