'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import styles from './page.module.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    let newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = '⚠️ Required';
    if (!password) newErrors.password = '⚠️ Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Ensure cookies are sent and received
    });

    const data = await res.json();

    //   if (res.ok) {
    //     setMessage('✅ Login successful!');
    //     document.cookie = `auth_token=${data.token}; path=/;`;
    //     setTimeout(() => {
    //       router.push('/dashboard');
    //     }, 1000);
    //   } else {
    //     setMessage(`❌ ${data.error || 'Login failed'}`);
    //   }
    // }

    if (res.ok) {
      setMessage('✅ Login successful!');
      // ✅ Immediately call /api/auth/verify-token after login
      const verifyRes = await fetch('/api/auth/verify-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (verifyRes.ok) {
        setTimeout(() => {
          router.push('/dashboard'); // ✅ Redirect after auth verification
        }, 1000);
      } else {
        console.warn('❌ Auth verification failed after login.');
      }
    } else {
      setMessage(`❌ ${data.error || 'Login failed'}`);
    }
  }

  return (
    <div className={styles.loginContainer}>
      {/* ✅ Left panel with login options */}
      <div className={styles.panelLeft}>
        <Link href="/" className={styles.backLink}>
          Back to Site
        </Link>
        <h1 className={styles.title}>Introducing Ballet</h1>
      </div>

      {/* ✅ Right panel containing the login form */}
      <div className={styles.panelRight}>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <h1 className={styles.heading}>Welcome Back!</h1>
          <p className={styles.subtitle}>
            Don’t have an account yet?{' '}
            <Link className="link--emphasis" href="/auth/signup">
              Sign up now
            </Link>
          </p>
          {/* ✅ Email input field */}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          {/* ✅ Password input field */}
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          {/* ✅ Remember me and forgot password options */}
          <div className={styles.optionsGroup}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <Link href="/auth/forgot-password" className="link--emphasis">
              Forgot password?
            </Link>
          </div>

          {/* ✅ Login button using the tertiary variant */}
          <Button
            type="submit"
            variant="secondary"
            className={styles.loginButton}
          >
            Log In
          </Button>

          {/* ✅ Display messages */}
          <p className={styles.message}>{message}</p>
        </form>
      </div>
    </div>
  );
}
