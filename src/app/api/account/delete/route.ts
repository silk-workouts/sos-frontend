import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const rawBody = await req.text();

    const { userId, token } = JSON.parse(rawBody);

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || decoded.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
        }
      );
    }

    // Fetch user data for logging
    const [userRows] = (await pool.query(
      `SELECT email, stripe_customer_id FROM users WHERE id = ? LIMIT 1`,
      [userId]
    )) as unknown as [
      Array<{ email: string; stripe_customer_id: string | null }>
    ];

    const user = userRows[0];

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const ip = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    // Cancel Stripe subscription
    if (user.stripe_customer_id) {
      const stripeCancelRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: `auth_token=${token}`,
          },
          body: JSON.stringify({
            reason: "User initiated deleting account",
          }),
        }
      );

      if (!stripeCancelRes.ok) {
        console.error("⚠️ Failed to cancel subscription for user:", userId);
      }
    }

    //  Log account deletion
    await pool.query(
      `INSERT INTO account_deletion_logs (user_id, email, ip_address, user_agent, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, user.email, ip, userAgent, "User initiated deleting account"]
    );

    //  Delete related user data (order matters if foreign key constraints exist)
    await pool.query(`DELETE FROM saved_programs WHERE user_id = ?`, [userId]);
    await pool.query(`DELETE FROM playlists WHERE user_id = ?`, [userId]);

    //Delete user
    await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);

    //  Clear auth cookie
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
    response.headers.set(
      "Set-Cookie",
      `auth_token=; Path=/; HttpOnly; Max-Age=0`
    );

    return response;
  } catch (error) {
    console.error("❌ Error in account deletion:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
