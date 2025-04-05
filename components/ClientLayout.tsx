'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import LogoHeader from "@/components/LogoHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/password-reset'];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, refreshSession } = useAuth();
  const [showBottomNav, setShowBottomNav] = useState(false);
  const refreshAttemptedRef = useRef(false);
  
  // Session refresh - only once on mount for authenticated users
  useEffect(() => {
    // Skip if no user or if we've already attempted a refresh in this session
    if (!user || refreshAttemptedRef.current) return;
    
    console.log('Performing initial session refresh');
    
    // Mark that we've attempted a refresh
    refreshAttemptedRef.current = true;
    
    // Only refresh once on mount, not repeatedly
    refreshSession();
    
    // We don't need to refresh every 15 minutes - the session is auto-refreshed by Supabase
    // when needed, and manual refreshes are causing rate limiting
  }, [user, refreshSession]);

  // Control bottom navigation visibility
  useEffect(() => {
    // Show bottom navigation only for these paths 
    const navPaths = ['/home', '/chat', '/profile', '/leaderboard'];
    const shouldShow = navPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    
    setShowBottomNav(shouldShow);
  }, [pathname]);

  // Determine if the current route needs protection
  const needsProtection = !PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Wrap with ProtectedRoute only if the route needs protection
  const wrappedContent = needsProtection ? (
    <ProtectedRoute>{children}</ProtectedRoute>
  ) : (
    children
  );

  // Only hide header on root page
  const isRootPage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isRootPage && <LogoHeader />}
      <main className={`flex-1 ${!isRootPage ? 'pt-16' : ''} ${showBottomNav ? 'pb-16' : ''}`}>
        {wrappedContent}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
} 