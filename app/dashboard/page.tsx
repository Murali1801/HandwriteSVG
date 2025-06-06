'use client';

import { Dashboard } from '@/components/dashboard';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/canvas');
  };

  const handleEditProject = (project: any) => {
    router.push(`/canvas?id=${project.id}`);
  };

  const handleLogout = async () => {
    try {
      await useAuth().logOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Dashboard
        user={user}
        onCreateNew={handleCreateNew}
        onEditProject={handleEditProject}
        onLogout={handleLogout}
        onOpenGenerator={() => router.push('/generator')}
      />
    </ProtectedRoute>
  );
} 