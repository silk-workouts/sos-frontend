import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * ✅Verify and decode a JWT token
 */
export function verifyToken(token: string): { id: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string };
}

/**
 * 🔐 Hash a reset token using SHA-256
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * 📬 Send a password reset email to the user
 */
export async function sendResetEmail(email: string, resetUrl: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  return result; // logs via request-resese route.ts
}
