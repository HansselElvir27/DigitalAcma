import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-nextauth-secret-here-change-in-production";

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;
        const role = (token as any)?.role;

        // Reject unauthenticated or public unprivileged users from dashboard
        if (!token || !role || role === "PUBLIC") {
            return NextResponse.redirect(new URL("/auth/signin", req.url));
        }

        // Full access for ADMIN across the entire system
        if (role === "ADMIN") {
            return NextResponse.next();
        }

        // Only ADMIN can access user management
        if (pathname.startsWith("/dashboard/usuarios")) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Role-specific restrictions for CAPITAN
        if (role === "CAPITAN") {
            if (pathname.startsWith("/dashboard/cim") || pathname.startsWith("/dashboard/info")) {
                return NextResponse.redirect(new URL("/dashboard/capitan", req.url));
            }
        }

        // Role-specific restrictions for CIM
        if (role === "CIM") {
            if (pathname.startsWith("/dashboard/capitan") || pathname.startsWith("/dashboard/inscripcion-embarcaciones")) {
                return NextResponse.redirect(new URL("/dashboard/cim", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        secret: NEXTAUTH_SECRET,
        callbacks: {
            authorized: ({ token }: { token: JWT | null }) => !!token,
        },
        pages: {
            signIn: "/auth/signin",
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
