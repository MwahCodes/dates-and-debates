'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import LogoHeader from "@/components/LogoHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only show bottom nav on these specific pages
  const showBottomNav = ['/home', '/chat', '/profile'].includes(pathname);
  
  // Don't show header on welcome page and auth-related pages
  const hideHeader = ['/', '/auth', '/signup'].includes(pathname);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col bg-white">
            {!hideHeader && <LogoHeader />}
            <main className={`flex-1 ${!hideHeader ? 'pt-16' : ''} ${showBottomNav ? 'pb-20' : ''}`}>
              {children}
            </main>
            {showBottomNav && <BottomNavigation />}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
