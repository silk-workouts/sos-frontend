import crypto from "crypto";
import pool from "@/lib/db";
import { hashToken, sendResetEmail } from "@/lib/auth";
import { logPasswordResetEvent } from "@/lib/logging";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Step 1: Look up the user by email
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const user =
    Array.isArray(rows) && rows.length > 0 ? (rows[0] as { id: string }) : null;

  // Always respond with success to prevent email enumeration
  if (!user) {
    return Response.json({ success: true });
  }

  // Step 2: Rate-limit reset requests (max 3 per hour)
  const [logs] = await pool.query(
    `SELECT COUNT(*) as count FROM password_reset_logs
     WHERE user_id = ? AND status = 'requested' AND created_at > NOW() - INTERVAL 1 HOUR`,
    [user.id]
  );

  const recentRequests =
    Array.isArray(logs) && logs.length > 0
      ? (logs[0] as { count: number }).count
      : 0;

  if (recentRequests >= 3) {
    return new Response(
      JSON.stringify({
        error: "Too many reset requests. Please try again later.",
      }),
      {
        status: 429, // Too Many Requests
      }
    );
  }

  // Step 3: Log the reset request
  await logPasswordResetEvent(user.id, "requested", req);

  // Step 4: Generate reset token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Step 5: Insert token into password_resets table
  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [user.id, tokenHash, expiresAt]
  );

  // Step 6: Send email
  // Step 6: Send email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}&id=${user.id}`;
  console.log("📩 Sending reset email to", email);
  console.log("🔗 Reset URL:", resetUrl);

  const result = await sendResetEmail(email, resetUrl);
  console.log("📬 Resend result:", result);

  return Response.json({ success: true });
}
