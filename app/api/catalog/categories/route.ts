import type { NextRequest } from "next/server";
import { getCategoriesForLocation } from "@/lib/square-service";
import { mapSquareError, errorResponse } from "@/lib/errors";
import { withLogging } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export const GET = withLogging(async (request: NextRequest) => {
  const locationId = request.nextUrl.searchParams.get("location_id");

  if (!locationId) {
    return Response.json(
      { error: "location_id query parameter is required", code: "MISSING_PARAM" },
      { status: 400 }
    );
  }

  try {
    const result = await getCategoriesForLocation(locationId);
    return Response.json(result);
  } catch (error) {
    return errorResponse(mapSquareError(error));
  }
});
