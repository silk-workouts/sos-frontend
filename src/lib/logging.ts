import pool from "@/lib/db";

export async function logPasswordResetEvent(
  userId: string,
  status: "requested" | "used" | "expired" | "invalid",
  req: Request
) {
  const ip = req.headers.get("x-forwarded-for") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  await pool.query(
    `INSERT INTO password_reset_logs (user_id, status, ip_address, user_agent)
     VALUES (?, ?, ?, ?)`,
    [userId, status, ip, userAgent]
  );
}
