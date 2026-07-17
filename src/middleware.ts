import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

function rateLimitExceeded(
  limit: number,
  remaining: number,
  reset: number,
  message = "Too many requests. Please try again later.",
) {
  const response = NextResponse.json({ error: message }, { status: 429 });
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(reset));
  response.headers.set(
    "Retry-After",
    String(Math.ceil((reset - Date.now()) / 1000)),
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    let maxRequests = 0;
    let message: string | undefined;
    const windowMs = 60_000;

    if (pathname === "/api/venues" && request.method === "POST") {
      maxRequests = 5;
    } else if (
      pathname === "/api/venues/nearby" &&
      request.method === "POST"
    ) {
      maxRequests = 30;
      message = "Perdon voy a necesitar unos segundos para recargar...";
    } else if (pathname === "/api/pageview") {
      maxRequests = 10;
    }

    if (maxRequests > 0) {
      const key = `${pathname}:${request.method}:${ip}`;
      const { success, remaining, reset } = checkRateLimit(
        key,
        maxRequests,
        windowMs,
      );
      if (!success) {
        return rateLimitExceeded(maxRequests, remaining, reset, message);
      }
    }

    return NextResponse.next();
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};
