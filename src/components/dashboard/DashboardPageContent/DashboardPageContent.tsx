'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('refresh')) {
      router.replace('/dashboard'); // Remove refresh param and reload
    }
  }, [searchParams, router]);

  return <div>Dashboard</div>;
}
