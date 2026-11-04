import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const rawSecret = process.env.NEXTAUTH_SECRET || "your-nextauth-secret-here-change-in-production";
const NEXTAUTH_SECRET = rawSecret.replace(/^["']|["']$/g, "").trim();

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Only protect /dashboard routes
    if (!pathname.startsWith("/dashboard")) {
        return NextResponse.next();
    }

    // Log ALL cookie headers for deep debugging
    const rawCookieHeader = req.headers.get("cookie") || "";
    const cookieNames = req.cookies.getAll().map(c => c.name).join(", ");
    console.log(`[MIDDLEWARE] ${pathname} | Raw-Cookie-Header: ${rawCookieHeader.substring(0, 300)} | Parsed: [${cookieNames || "NONE"}]`);

    // Try all possible cookie names
    let token = null;

    // 1. __Secure- prefix (HTTPS with proxy)
    if (!token) {
        token = await getToken({
            req,
            secret: NEXTAUTH_SECRET,
            cookieName: "__Secure-next-auth.session-token",
            secureCookie: true,
        });
        if (token) console.log(`[MIDDLEWARE] Token found via __Secure-next-auth.session-token`);
    }

    // 2. Plain name (no prefix)
    if (!token) {
        token = await getToken({
            req,
            secret: NEXTAUTH_SECRET,
            cookieName: "next-auth.session-token",
            secureCookie: false,
        });
        if (token) console.log(`[MIDDLEWARE] Token found via next-auth.session-token`);
    }

    // 3. NextAuth default auto-detect
    if (!token) {
        token = await getToken({ req, secret: NEXTAUTH_SECRET });
        if (token) console.log(`[MIDDLEWARE] Token found via getToken() default`);
    }

    const role = (token as any)?.role;
    console.log(`[MIDDLEWARE] ${pathname} | Token: ${!!token} | Role: ${role || "NONE"}`);

    // Reject unauthenticated or public unprivileged users from dashboard
    if (!token || !role || role === "PUBLIC") {
        console.log(`[MIDDLEWARE] Denied ${pathname} -> redirecting to /auth/signin`);
        const signInUrl = new URL("/auth/signin", req.nextUrl);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Full access for ADMIN across the entire system
    if (role === "ADMIN") {
        return NextResponse.next();
    }

    // Only ADMIN can access user management
    if (pathname.startsWith("/dashboard/usuarios")) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // Role-specific restrictions for CAPITAN
    if (role === "CAPITAN") {
        if (pathname.startsWith("/dashboard/cim") || pathname.startsWith("/dashboard/info")) {
            return NextResponse.redirect(new URL("/dashboard/capitan", req.nextUrl));
        }
    }

    // Role-specific restrictions for CIM
    if (role === "CIM") {
        if (pathname.startsWith("/dashboard/capitan") || pathname.startsWith("/dashboard/inscripcion-embarcaciones")) {
            return NextResponse.redirect(new URL("/dashboard/cim", req.nextUrl));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/:path*"],
};
