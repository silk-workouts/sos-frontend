import { NextRequest, NextResponse } from "next/server";
import { edgeDb } from "@/lib/edge-db";

export async function middleware(req: NextRequest) {
  const token = req.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-token`;

    const res = await fetch(verifyUrl, {
      method: "GET", // Use GET method to align with the verify-token route
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
      credentials: "include", // Ensure cookies are sent
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const { userId } = await res.json();

    const result = await edgeDb.execute(
      "SELECT is_paid_user FROM users WHERE id = ?",
      [userId]
    );

    const rows = (result as any).rows as { is_paid_user: number }[];
    const user = rows.length > 0 ? rows[0] : undefined;

    if (!user) {
      console.log("❌ No user found in database, redirecting to login...");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const isPaidUser = Boolean(user.is_paid_user);

    const path = req.nextUrl.pathname;

    if (!isPaidUser && path.startsWith("/dashboard")) {
      if (path !== "/dashboard/subscribe") {
        console.log("🚫 User is not paid, redirecting to subscribe page...");
        return NextResponse.redirect(new URL("/dashboard/subscribe", req.url));
      } else {
        console.log("🛑 Already on subscribe page, not redirecting.");
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Middleware error:", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"], // Only match dashboard routes
};
