'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import './DashboardPageContent.scss';

export default function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('refresh')) {
      router.replace('/dashboard'); // Remove refresh param and reload
    }
  }, [searchParams, router]);

  return <div className="dashboard">Paid user main page</div>;
}
