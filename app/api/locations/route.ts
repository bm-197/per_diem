import type { NextRequest } from "next/server";
import { getLocations } from "@/lib/square-service";
import { mapSquareError, errorResponse } from "@/lib/errors";
import { withLogging } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export const GET = withLogging(async (_request: NextRequest) => {
  try {
    const result = await getLocations();
    return Response.json(result);
  } catch (error) {
    return errorResponse(mapSquareError(error));
  }
});
