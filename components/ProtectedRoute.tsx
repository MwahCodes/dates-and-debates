'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/password-reset'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [needsRedirect, setNeedsRedirect] = useState(false);

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle redirect in useEffect, not during render
  useEffect(() => {
    // Only redirect if auth is not loading, user is not authenticated, and route is protected
    if (!isLoading && !user && !isPublicRoute) {
      console.log('Protected route accessed without authentication, redirecting to login');
      // Set a small delay to prevent rapid redirects
      const redirectTimeout = setTimeout(() => {
        router.push('/login');
      }, 100);
      
      setNeedsRedirect(true);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [user, isLoading, isPublicRoute, router]);

  // 1. Still loading auth state - show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  // 2. Not logged in and on a protected route - show redirect message
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Please log in to continue...</div>
      </div>
    );
  }
  
  // 3. User is logged in or this is a public route - render children
  return <>{children}</>;
} 