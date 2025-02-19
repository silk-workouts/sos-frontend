'use client';
import { useState } from 'react';
import { sendVerificationEmail } from '@/lib/sendVerificationEmail';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault(); // ✅ Prevent form from reloading the page

    if (!email || !password) {
      setMessage('Email and password are required!');
      return;
    }

    try {
      console.log('🛠️ Attempting signup...');

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await sendVerificationEmail(data.email, data.verificationToken);

        // Clear form fields after successful signup
        setEmail('');
        setPassword('');

        setMessage(
          'Signup successful! Check your email (including SPAM folder) for verification.'
        );
      } else {
        console.error('❌ Signup failed:', data);
        setMessage(data.error || 'Signup failed.');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setMessage('An error occurred.');
    }
  }

  return (
    <form onSubmit={handleSignup}>
      {' '}
      <h1>Signup</h1>
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
      <button type="submit">Sign Up</button> {/* ✅ Use type="submit" */}
      <p>{message}</p>
    </form>
  );
}
