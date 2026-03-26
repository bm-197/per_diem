import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Webhook endpoint for Square catalog.version.updated events.
 * Busts all catalog-related cache entries when the catalog changes.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "catalog.version.updated") {
      await Promise.all([
        invalidateCache("catalog:*"),
        invalidateCache("categories:*"),
      ]);

      console.log(
        JSON.stringify({
          event: "cache_invalidated",
          trigger: "catalog.version.updated",
          timestamp: new Date().toISOString(),
        })
      );
    }

    return Response.json({ received: true });
  } catch {
    return Response.json({ received: true });
  }
}
