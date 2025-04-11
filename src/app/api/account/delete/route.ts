import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { userId, token } = await req.json();

    // Step 1: Verify token
    const decoded = verifyToken(token);
    if (!decoded || decoded.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
        }
      );
    }

    // Step 2: Fetch user data for logging
    const [userRows] = (await pool.query(
      `SELECT email FROM users WHERE id = ? LIMIT 1`,
      [userId]
    )) as unknown as [Array<{ email: string }>];

    const user = userRows[0];

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const ip = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    // Step 3: Log account deletion
    await pool.query(
      `INSERT INTO account_deletion_logs (user_id, email, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [userId, user.email, ip, userAgent]
    );

    // Step 4: Delete related user data (order matters if foreign key constraints exist)
    await pool.query(`DELETE FROM saved_programs WHERE user_id = ?`, [userId]);
    await pool.query(`DELETE FROM playlists WHERE user_id = ?`, [userId]);

    // Step 5: Delete user
    await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);

    // Step 6: Clear auth cookie
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
