'use client';

import { Suspense } from 'react';
import DashboardPageContent from '@/components/dashboard/DashboardPageContent/DashboardPageContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
