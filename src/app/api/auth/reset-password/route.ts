import { hashToken } from "@/lib/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { logPasswordResetEvent } from "@/lib/logging";

export async function POST(req: Request) {
  const { userId, token, newPassword } = await req.json();

  // Hash the received token
  const tokenHash = hashToken(token);

  // Step 1: Look up valid password reset entry
  const [rows] = await pool.query(
    `SELECT id, expires_at FROM password_resets WHERE user_id = ? AND token_hash = ? LIMIT 1`,
    [userId, tokenHash]
  );

  const resetEntry =
    Array.isArray(rows) && rows.length > 0
      ? (rows[0] as { id: number; expires_at: Date })
      : null;

  if (!resetEntry) {
    await logPasswordResetEvent(userId, "invalid", req);
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 400,
    });
  }

  // Step 2: Check expiration
  const now = new Date();
  if (new Date(resetEntry.expires_at) < now) {
    await logPasswordResetEvent(userId, "expired", req);
    return new Response(JSON.stringify({ error: "Token expired" }), {
      status: 400,
    });
  }

  // Step 3: Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Step 4: Update user password
  await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [
    hashedPassword,
    userId,
  ]);

  // Step 5: Remove the used reset token
  await pool.query(`DELETE FROM password_resets WHERE id = ?`, [resetEntry.id]);

  // Step 6: Log successful reset
  await logPasswordResetEvent(userId, "used", req);

  return Response.json({ success: true });
}
