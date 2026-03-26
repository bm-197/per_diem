import type { ApiErrorResponse } from "./types";

/** Map a Square SDK error (or any error) to our consistent API error shape. */
export function mapSquareError(error: unknown): ApiErrorResponse {
  if (error && typeof error === "object" && "statusCode" in error) {
    const sqErr = error as {
      statusCode: number;
      body?: { errors?: Array<{ detail?: string; code?: string; category?: string }> };
    };
    const first = sqErr.body?.errors?.[0];
    return {
      error: first?.detail ?? "Square API error",
      code: first?.code ?? "SQUARE_API_ERROR",
      status: sqErr.statusCode,
    };
  }

  return {
    error: error instanceof Error ? error.message : "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    status: 500,
  };
}

/** Create a JSON Response from an ApiErrorResponse. */
export function errorResponse(apiError: ApiErrorResponse): Response {
  return Response.json(
    { error: apiError.error, code: apiError.code },
    { status: apiError.status }
  );
}
