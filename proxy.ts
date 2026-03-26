import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 proxy — logs incoming API requests.
 * Runs before route handlers on matched paths.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-start", Date.now().toString());

  console.log(
    JSON.stringify({
      type: "request",
      method: request.method,
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    })
  );

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: "/api/:path*",
};
