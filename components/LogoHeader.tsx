'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LogoHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="px-4 py-2">
        <Link href="/home">
          <div className="relative w-[120px] h-[40px]">
            <Image
              src="/logo.png"
              alt="Dates & Debates Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>
    </header>
  );
} 