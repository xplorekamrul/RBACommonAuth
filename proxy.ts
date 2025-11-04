import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; 

const ROLE_ADMIN = "ADMIN";
const ROLE_SUPER = "SUPER_ADMIN";
const ROLE_DEV = "DEVELOPER";

const isUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(base + "/");

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const publicPrefixes = [
    "/",
    "/login",
    "/register",
    "/api/auth", 
    "/favicon.ico",
    "/_next",
    "/assets",
    "/public",
  ];
  for (const p of publicPrefixes) {
    if (pathname === p || pathname.startsWith(p + "/")) return NextResponse.next();
  }


  const session = await auth(); 
  const role = (session?.user as any)?.role as string | undefined;

  const requireLogin = (redirectTo = "/login") => {
    url.pathname = redirectTo;
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  };

  if (isUnder(pathname, "/developer")) {
    if (!session?.user) return requireLogin();
    if (role !== ROLE_DEV) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isUnder(pathname, "/super-admin")) {
    if (!session?.user) return requireLogin();
    if (role === ROLE_SUPER || role === ROLE_DEV) {
      return NextResponse.next();
    }
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  if (isUnder(pathname, "/admin")) {
    if (!session?.user) return requireLogin();
    if (role === ROLE_ADMIN || role === ROLE_SUPER || role === ROLE_DEV) {
      return NextResponse.next();
    }
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/admin/:path*", "/super/:path*", "/developer/:path*"],
};
