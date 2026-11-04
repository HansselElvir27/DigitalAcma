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

    // 1. Try reading standard next-auth.session-token
    let token = await getToken({
        req,
        secret: NEXTAUTH_SECRET,
        cookieName: "next-auth.session-token",
        secureCookie: false,
    });

    // 2. Try __Secure- prefix fallback
    if (!token) {
        token = await getToken({
            req,
            secret: NEXTAUTH_SECRET,
            cookieName: "__Secure-next-auth.session-token",
            secureCookie: true,
        });
    }

    // 3. Try default
    if (!token) {
        token = await getToken({
            req,
            secret: NEXTAUTH_SECRET,
        });
    }

    const role = (token as any)?.role;
    const cookieNames = req.cookies.getAll().map(c => c.name).join(", ");
    console.log(`[MIDDLEWARE] ${pathname} | Cookies: [${cookieNames || "NONE"}] | Token: ${!!token} | Role: ${role || "NONE"}`);

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
