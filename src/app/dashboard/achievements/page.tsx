'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/ui/Loading';

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <p className="text-lg text-gray-600">Em desenvolvimento</p>
      </div>
    </DashboardLayout>
  );
}