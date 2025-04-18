import { NextRequest, NextResponse } from "next/server";
import { edgeDb } from "@/lib/edge-db";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Skip auth routes manually
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const token = req.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  const res = NextResponse.next();

  if (!token) {
    const redirectRes = NextResponse.redirect(new URL("/auth/login", req.url));
    redirectRes.cookies.set("is_paid_user", "false", { path: "/" });
    return redirectRes;
  }

  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-token`;

    const verifyRes = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${token}`,
      },
      credentials: "include",
    });

    if (!verifyRes.ok) {
      const redirectRes = NextResponse.redirect(
        new URL("/auth/login", req.url)
      );
      redirectRes.cookies.set("is_paid_user", "false", { path: "/" });
      return redirectRes;
    }

    const { userId } = await verifyRes.json();

    const result = await edgeDb.execute(
      "SELECT is_paid_user FROM users WHERE id = ?",
      [userId]
    );

    const rows = (result as any).rows as { is_paid_user: number }[];
    const user = rows.length > 0 ? rows[0] : undefined;

    if (!user) {
      const redirectRes = NextResponse.redirect(
        new URL("/auth/login", req.url)
      );
      redirectRes.cookies.set("is_paid_user", "false", { path: "/" });
      return redirectRes;
    }

    const isPaidUser = Boolean(user.is_paid_user);
    res.cookies.set("is_paid_user", String(isPaidUser), { path: "/" });

    const path = req.nextUrl.pathname;

    if (path.startsWith("/stripe/success")) {
      return res;
    }

    if (!isPaidUser && path.startsWith("/dashboard")) {
      if (path !== "/dashboard/subscribe") {
        const redirectRes = NextResponse.redirect(
          new URL("/dashboard/subscribe", req.url)
        );
        redirectRes.cookies.set("is_paid_user", "false", { path: "/" });
        return redirectRes;
      }
    }

    return res;
  } catch (error) {
    console.error("❌ Middleware error:", error);
    const redirectRes = NextResponse.redirect(new URL("/auth/login", req.url));
    redirectRes.cookies.set("is_paid_user", "false", { path: "/" });
    return redirectRes;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
