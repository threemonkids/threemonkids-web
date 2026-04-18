import { type NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/supabase/middleware";
import { detectLang } from "@/lib/utils/lang";
import { isValidLang } from "@/lib/i18n/config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect bare / to /ko or /en
  if (pathname === "/") {
    const lang = detectLang(request.headers.get("accept-language"));
    return NextResponse.redirect(new URL(`/${lang}`, request.url));
  }

  // Validate [lang] segment for public routes
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (
    firstSegment &&
    !isValidLang(firstSegment) &&
    firstSegment !== "api"
  ) {
    // Unknown top-level segment — let Next.js handle (will 404)
    return NextResponse.next();
  }

  // Refresh Supabase session on every request
  return await refreshSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets (brand/, og/)
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|og/).*)",
  ],
};
