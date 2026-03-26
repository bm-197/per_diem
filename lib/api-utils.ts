import type { NextRequest } from "next/server";

type RouteHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<Response>;

/**
 * Wraps an API route handler with structured JSON logging.
 * Logs method, path, status code, and duration in milliseconds.
 */
export function withLogging(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    const start = Date.now();
    const response = await handler(request, context);
    const duration = Date.now() - start;

    console.log(
      JSON.stringify({
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      })
    );

    return response;
  };
}
