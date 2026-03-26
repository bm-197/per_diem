import type * as Square from "square";
import type {
  Location,
  CategoryGroup,
  MenuItem,
  Variation,
  ModifierList,
  Modifier,
  CategorySummary,
} from "./types";
import { formatPrice } from "./utils";

/** Filter to ACTIVE locations and map to our simplified Location shape. */
export function transformLocations(
  squareLocations: Square.Location[]
): Location[] {
  return squareLocations
    .filter((loc) => loc.status === "ACTIVE")
    .map((loc) => ({
      id: loc.id ?? "",
      name: loc.name ?? "Unnamed Location",
      address: {
        line1: loc.address?.addressLine1 ?? undefined,
        city: loc.address?.locality ?? undefined,
        state: loc.address?.administrativeDistrictLevel1 ?? undefined,
        postalCode: loc.address?.postalCode ?? undefined,
      },
      timezone: loc.timezone ?? "America/New_York",
      status: "ACTIVE" as const,
    }));
}

/** Check if a catalog object is available at a specific location. */
function isPresentAtLocation(
  obj: {
    presentAtAllLocations?: boolean;
    presentAtLocationIds?: string[];
    absentAtLocationIds?: string[];
  },
  locationId: string
): boolean {
  if (obj.absentAtLocationIds?.includes(locationId)) return false;
  if (obj.presentAtAllLocations !== false) return true;
  return obj.presentAtLocationIds?.includes(locationId) ?? false;
}

/**
 * Build lookup maps from related objects for O(1) resolution
 * of category names, image URLs, and modifier lists.
 */
function buildLookups(relatedObjects: Square.CatalogObject[]): {
  categories: Map<string, string>;
  images: Map<string, string>;
  modifierLists: Map<string, Square.CatalogObject.ModifierList>;
} {
  const categories = new Map<string, string>();
  const images = new Map<string, string>();
  const modifierLists = new Map<string, Square.CatalogObject.ModifierList>();

  for (const obj of relatedObjects) {
    if (obj.type === "CATEGORY") {
      const catObj = obj as Square.CatalogObject.Category;
      if (catObj.id && catObj.categoryData?.name) {
        categories.set(catObj.id, catObj.categoryData.name);
      }
    }
    if (obj.type === "IMAGE") {
      const imgObj = obj as Square.CatalogObject.Image;
      if (imgObj.id && imgObj.imageData?.url) {
        images.set(imgObj.id, imgObj.imageData.url);
      }
    }
    if (obj.type === "MODIFIER_LIST") {
      const mlObj = obj as Square.CatalogObject.ModifierList;
      if (mlObj.id) {
        modifierLists.set(mlObj.id, mlObj);
      }
    }
  }

  return { categories, images, modifierLists };
}

/** Transform a single ITEM_VARIATION catalog object into our Variation type. */
function transformVariation(
  varObj: Square.CatalogObject
): Variation | null {
  if (varObj.type !== "ITEM_VARIATION") return null;
  const v = (varObj as Square.CatalogObject.ItemVariation).itemVariationData;
  if (!v) return null;

  const amount = Number(v.priceMoney?.amount ?? 0);
  const currency = v.priceMoney?.currency ?? "USD";

  return {
    id: varObj.id,
    name: v.name ?? "Regular",
    price: amount,
    formattedPrice: formatPrice(amount, currency),
    currency,
  };
}

/** Transform a Square MODIFIER_LIST into our ModifierList type. */
function transformModifierList(
  mlObj: Square.CatalogObject.ModifierList
): ModifierList {
  const mlData = mlObj.modifierListData;
  const modifiers: Modifier[] = (mlData?.modifiers ?? [])
    .filter((m): m is Square.CatalogObject.Modifier => m.type === "MODIFIER")
    .map((m) => {
      const md = m.modifierData;
      const price = Number(md?.priceMoney?.amount ?? 0);
      const currency = md?.priceMoney?.currency ?? "USD";
      return {
        id: m.id,
        name: md?.name ?? "Unknown",
        price,
        formattedPrice: price > 0 ? `+${formatPrice(price, currency)}` : "",
        currency,
        onByDefault: md?.onByDefault ?? false,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    id: mlObj.id,
    name: mlData?.name ?? "Options",
    minSelected: Number(mlData?.minSelectedModifiers ?? 0),
    maxSelected: Number(mlData?.maxSelectedModifiers ?? 0),
    modifiers,
  };
}

/**
 * Transform raw Square catalog objects + related objects into
 * CategoryGroup[] grouped by category, filtered by location.
 */
export function transformCatalogItems(
  objects: Square.CatalogObject[],
  relatedObjects: Square.CatalogObject[],
  locationId: string
): CategoryGroup[] {
  const { categories: categoryMap, images: imageMap, modifierLists: modifierListMap } =
    buildLookups(relatedObjects);

  const grouped = new Map<string, { category: { id: string; name: string }; items: MenuItem[] }>();

  for (const obj of objects) {
    if (obj.type !== "ITEM") continue;
    const item = obj as Square.CatalogObject.Item;

    if (!isPresentAtLocation(item, locationId)) continue;

    const itemData = item.itemData;
    if (!itemData) continue;

    // Resolve image URL: prefer imageIds array, fall back to base imageId
    let imageUrl: string | null = null;
    if (itemData.imageIds?.length) {
      imageUrl = imageMap.get(itemData.imageIds[0]) ?? null;
    } else if (item.imageId) {
      imageUrl = imageMap.get(item.imageId) ?? null;
    }

    // Resolve category
    const itemCategory = itemData.categories?.[0];
    const categoryId = itemCategory?.id ?? "uncategorized";
    const categoryName =
      (itemCategory?.id ? categoryMap.get(itemCategory.id) : null) ??
      itemCategory?.categoryData?.name ??
      "Uncategorized";

    // Transform variations
    const variations: Variation[] = (itemData.variations ?? [])
      .map(transformVariation)
      .filter((v): v is Variation => v !== null);

    // Transform modifier lists
    const modifierLists: ModifierList[] = (itemData.modifierListInfo ?? [])
      .map((info) => {
        const mlObj = modifierListMap.get(info.modifierListId);
        if (!mlObj) return null;
        const ml = transformModifierList(mlObj);
        // Apply item-level overrides for min/max if set
        if (info.minSelectedModifiers != null && info.minSelectedModifiers >= 0) {
          ml.minSelected = info.minSelectedModifiers;
        }
        if (info.maxSelectedModifiers != null && info.maxSelectedModifiers >= 0) {
          ml.maxSelected = info.maxSelectedModifiers;
        }
        return ml;
      })
      .filter((ml): ml is ModifierList => ml !== null && ml.modifiers.length > 0);

    const menuItem: MenuItem = {
      id: item.id,
      name: itemData.name ?? "Unnamed Item",
      description: itemData.descriptionPlaintext ?? itemData.description ?? "",
      categoryName,
      imageUrl,
      variations,
      modifierLists,
    };

    if (!grouped.has(categoryId)) {
      grouped.set(categoryId, {
        category: { id: categoryId, name: categoryName },
        items: [],
      });
    }
    grouped.get(categoryId)!.items.push(menuItem);
  }

  // Sort categories alphabetically, items within each category alphabetically
  return Array.from(grouped.values())
    .sort((a, b) => a.category.name.localeCompare(b.category.name))
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

/** Derive category summaries with item counts from grouped catalog data. */
export function transformCategories(
  categoryGroups: CategoryGroup[]
): CategorySummary[] {
  return categoryGroups.map((group) => ({
    id: group.category.id,
    name: group.category.name,
    itemCount: group.items.length,
  }));
}

/** Deduplicate catalog objects by ID (related objects may repeat across pages). */
export function deduplicateById(
  objects: Square.CatalogObject[]
): Square.CatalogObject[] {
  const seen = new Set<string>();
  return objects.filter((obj) => {
    if (!obj.id || seen.has(obj.id)) return false;
    seen.add(obj.id);
    return true;
  });
}
