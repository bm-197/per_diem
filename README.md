# Per Diem Coffee — Square Menu App

A mobile-first restaurant menu web app that connects to the Square Catalog API and displays menu items filtered by location and category.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Square SDK | `square` npm package |
| Styling | Tailwind CSS v4 |
| Caching | Upstash Redis (HTTP-based, serverless) |
| Testing | Vitest + React Testing Library |
| Package Manager | pnpm |
| Containerization | Docker + docker-compose |

## Quick Start

### Prerequisites
- Node.js 20.9+
- pnpm
- Square Developer account ([sign up](https://developer.squareup.com))
- Upstash Redis database ([sign up](https://console.upstash.com))

### Setup

```bash
# Clone and install
git clone <repo-url>
cd per_diem
pnpm install

# Configure environment
cp .env.example .env
# Fill in your Square sandbox token and Upstash credentials

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker

```bash
# Development (hot reload)
docker-compose up

# Production
DOCKER_TARGET=prod docker-compose up --build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SQUARE_ACCESS_TOKEN` | Square sandbox or production access token |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

## Architecture

### API Routes (Backend Proxy)

Square credentials never reach the client. All Square API calls go through Next.js API routes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/locations` | GET | List active Square locations |
| `/api/catalog?location_id=X` | GET | Menu items grouped by category for a location |
| `/api/catalog/categories?location_id=X` | GET | Category summaries with item counts |
| `/api/webhooks/square` | POST | Square webhook for cache invalidation |

### Caching

Upstash Redis with 5-minute TTL. Works identically in local dev, Docker, and Vercel since it's HTTP-based (no TCP connections).

Cache keys: `locations`, `catalog:{locationId}`, `categories:{locationId}`

Cache invalidation: Square webhook (`catalog.version.updated`) busts all catalog/category cache entries.

### Data Flow

```
Square API → API Route → Transform + Cache → JSON Response → Client Hook → Component
```

1. **Fetch**: Paginate through Square's `SearchCatalogObjects` with `includeRelatedObjects: true`
2. **Join**: Resolve category names and image URLs from `relatedObjects` via ID lookup maps
3. **Filter**: Check `presentAtAllLocations`, `presentAtLocationIds`, `absentAtLocationIds`
4. **Transform**: Convert BigInt prices to Number, format as "$X.XX", group by category
5. **Cache**: Store assembled result in Redis
6. **Serve**: Return typed JSON to the frontend

### Frontend

- **Server Components** by default, `"use client"` only for interactive components
- Custom hooks (`useLocations`, `useCatalog`, `useCategories`, `useSearch`) for data fetching
- Mobile-first responsive grid: 2 columns on mobile, 4-5 on desktop
- Loading skeletons, error states with retry, empty states
- Location persisted to `localStorage`

## Project Structure

```
per_diem/
├── app/
│   ├── api/
│   │   ├── locations/route.ts
│   │   ├── catalog/route.ts
│   │   ├── catalog/categories/route.ts
│   │   └── webhooks/square/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── MenuContent.tsx          # Main orchestrator (client)
│   ├── Header.tsx               # Location selector + search
│   ├── CategoryNav.tsx          # Horizontal scrollable pills
│   ├── MenuSection.tsx          # Category heading + item grid
│   ├── MenuItemCard.tsx         # Individual menu item
│   ├── LoadingSkeleton.tsx
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   └── Footer.tsx
├── lib/
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── square.ts                # Square SDK singleton
│   ├── cache.ts                 # Upstash Redis wrapper
│   ├── errors.ts                # Error mapping
│   ├── square-transformers.ts   # Square → app data transforms
│   ├── square-service.ts        # Business logic (fetch + cache)
│   ├── api-utils.ts             # Request logging wrapper
│   ├── utils.ts                 # formatPrice, truncateText
│   └── hooks/
│       ├── useLocations.ts
│       ├── useCatalog.ts
│       ├── useCategories.ts
│       └── useSearch.ts
├── __tests__/                   # 49 tests across 8 files
├── proxy.ts                     # Request logging (Next.js 16)
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Testing

```bash
pnpm test          # Watch mode
pnpm test:run      # Single run
pnpm test:coverage # With coverage
```

**49 tests** covering:
- Unit: price formatting, text truncation, BigInt serialization
- Unit: cache get/set/delete/invalidate (mocked Redis)
- Unit: Square data transformers (location filtering, category grouping, image resolution, BigInt prices)
- Component: CategoryNav, MenuItemCard, LocationSelector
- Integration: API route handlers with mocked services

## Trade-offs & Assumptions

1. **Upstash Redis over in-memory cache**: In-memory caching is useless on Vercel serverless (no shared memory between invocations). Upstash Redis adds ~2ms latency per cache operation but works correctly in serverless.

2. **Catalog search over list**: Using `SearchCatalogObjects` with `includeRelatedObjects: true` to get items + categories + images in one paginated call, rather than making separate calls.

3. **Client-side category filtering**: Categories are fetched upfront and filtering happens client-side for instant UI response. The full catalog is fetched once per location and cached.

4. **No SSR for menu data**: Menu content is fetched client-side via hooks because location selection is user-driven (stored in localStorage). SSR would require a default location assumption.

5. **Square SDK BigInt handling**: The SDK returns `bigint` for monetary amounts. We convert to `Number` at the transformation layer since menu prices won't exceed `Number.MAX_SAFE_INTEGER`.

## Commands

```bash
pnpm dev            # Development server
pnpm build          # Production build
pnpm start          # Start production server
pnpm test           # Run tests (watch)
pnpm test:run       # Run tests (once)
pnpm lint           # ESLint
```
