import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        if (path.startsWith("/dashboard/patient") && token?.role !== "patient") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (path.startsWith("/dashboard/doctor") && token?.role !== "doctor") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        if (path.startsWith("/dashboard/admin") && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
