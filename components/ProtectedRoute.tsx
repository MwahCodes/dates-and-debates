'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to root page and auth pages without authentication
    if (!loading && !user && pathname !== '/' && !pathname.startsWith('/auth')) {
      router.push('/auth');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Allow access to root page and auth pages without authentication
  if (!user && pathname !== '/' && !pathname.startsWith('/auth')) {
    return null;
  }

  return <>{children}</>;
} 