import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/", req.url));

  // ✅ Clear the JWT cookie
  response.cookies.set("auth_token", "", { maxAge: -1 });

  return response;
}
