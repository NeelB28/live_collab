import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // For now, just let all requests pass through
  // We'll enhance this later when we add authentication

  console.log("Middleware running for:", request.nextUrl.pathname);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
