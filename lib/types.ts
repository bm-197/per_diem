/** Consistent error shape returned by all API endpoints */
export interface ApiErrorResponse {
  error: string;
  code: string;
  status: number;
}

// ─── Locations ───────────────────────────────────────────────

export interface LocationResponse {
  locations: Location[];
}

export interface Location {
  id: string;
  name: string;
  address: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  timezone: string;
  status: "ACTIVE";
}

// ─── Catalog ─────────────────────────────────────────────────

export interface CatalogResponse {
  categories: CategoryGroup[];
}

export interface CategoryGroup {
  category: { id: string; name: string };
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryName: string;
  imageUrl: string | null;
  variations: Variation[];
}

export interface Variation {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  currency: string;
}

// ─── Categories ──────────────────────────────────────────────

export interface CategoriesResponse {
  categories: CategorySummary[];
}

export interface CategorySummary {
  id: string;
  name: string;
  itemCount: number;
}
