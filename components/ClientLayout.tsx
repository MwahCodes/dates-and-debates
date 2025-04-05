'use client';

import { usePathname } from 'next/navigation';
import LogoHeader from "@/components/LogoHeader";
import BottomNavigation from "@/components/BottomNavigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only show bottom nav on these specific pages
  const showBottomNav = ['/home', '/chat', '/profile'].includes(pathname);
  
  // Only hide header on root page
  const isRootPage = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {!isRootPage && <LogoHeader />}
      <main className={`flex-1 ${!isRootPage ? 'pt-16' : ''} ${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
} 