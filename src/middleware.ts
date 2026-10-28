import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;
        const role = (token as any)?.role;

        // Reject public unprivileged users from all dashboard routes
        if (!role || role === "PUBLIC") {
            return NextResponse.redirect(new URL("/auth/signin", req.url));
        }

        // Only ADMIN can manage users and system ports
        if (pathname.startsWith("/dashboard/usuarios") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Restrict CIM-specific views
        if (pathname.startsWith("/dashboard/cim") && role === "CAPITAN") {
            return NextResponse.redirect(new URL("/dashboard/capitan", req.url));
        }

        // Restrict CAPITAN-specific dashboard
        if (pathname.startsWith("/dashboard/capitan") && role === "CIM") {
            return NextResponse.redirect(new URL("/dashboard/cim", req.url));
        }

        // Restrict Information Requests to CIM and ADMIN
        if (pathname.startsWith("/dashboard/info") && role === "CAPITAN") {
            return NextResponse.redirect(new URL("/dashboard/capitan", req.url));
        }

        // Restrict Vessel Inspection to CAPITAN and ADMIN
        if (pathname.startsWith("/dashboard/inscripcion-embarcaciones") && role === "CIM") {
            return NextResponse.redirect(new URL("/dashboard/cim", req.url));
        }

        return NextResponse.next();
    },
    {
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
