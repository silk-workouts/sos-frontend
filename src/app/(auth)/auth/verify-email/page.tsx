'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [message, setMessage] = useState('Verifying...');
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setMessage('Invalid or missing verification token.');
        return;
      }

      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Email verified! You can now log in.');
      } else {
        setMessage(`❌ ${data.error || 'Verification failed.'}`);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{message}</p>
      <button onClick={() => router.push('/auth/login')}>Go to Login</button>
    </div>
  );
}
