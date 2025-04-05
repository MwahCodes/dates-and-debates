'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LogoHeader from "@/components/LogoHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, supabase, isLoading } = useAuth();
  const [showBottomNav, setShowBottomNav] = useState(false);
  
  // Check for token expiration and refresh if needed
  useEffect(() => {
    const checkSession = async () => {
      if (!isLoading && user) {
        try {
          // Periodically refresh the session to ensure it stays valid
          await supabase.auth.refreshSession();
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      }
    };
    
    checkSession();
    
    // Set up an interval to check session every 30 minutes
    const interval = setInterval(checkSession, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, supabase, isLoading]);

  useEffect(() => {
    // Paths that should show the bottom navigation
    const showNavPaths = ['/home', '/chat', '/profile'];
    
    // Check if current path should show bottom nav
    const shouldShowBottomNav = showNavPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    
    setShowBottomNav(shouldShowBottomNav);
  }, [pathname]);

  // Function to determine if the current route needs protection
  const isProtectedRoute = () => {
    const publicRoutes = ['/', '/login', '/signup', '/password-reset'];
    return !publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  };

  // Wrap with ProtectedRoute only if the route needs protection
  const wrappedContent = isProtectedRoute() ? (
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