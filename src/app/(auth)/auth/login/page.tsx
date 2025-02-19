'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

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
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log In</button>
      <p>{message}</p>
    </form>
  );
}
