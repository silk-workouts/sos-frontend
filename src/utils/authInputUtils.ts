// Email validation: Basic regex for common email formats
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation:
// - Minimum 8 characters
// - At least one uppercase letter, one lowercase letter, one number
// - No spaces allowed
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Password reset token validation: Simple length and character check
export function isValidResetToken(token: string): boolean {
  return typeof token === "string" && token.length === 64;
}

// Sanitize email to prevent XSS or injection attacks
export function sanitizeEmail(email: string): string {
  return email.replace(/[^\w@.-]/g, "");
}

// Sanitize password: Though passwords should not be manipulated,
// basic sanitization can prevent accidental issues
export function sanitizePassword(password: string): string {
  return password.replace(/[\s]/g, ""); // Remove whitespace
}
