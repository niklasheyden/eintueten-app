"use client";

import { useAuth } from '@/lib/AuthContext';
import { usePathname } from 'next/navigation';
import MobileTabBar from './MobileTabBar';

export default function ConditionalMobileNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show mobile nav if user is not authenticated or on homepage
  const shouldShowMobileNav = user && pathname !== '/';

  if (loading) {
    return null; // Don't show anything while loading
  }

  return (
    <>
      {/* Mobile header with logo */}
      {shouldShowMobileNav && (
        <div className="md:hidden flex items-center h-14 border-b border-gray-200 bg-white sticky top-0 z-40 pl-4">
          <span className="font-bold text-lg text-gray-800">Eintüten</span>
        </div>
      )}

      {/* Mobile tab bar */}
      {shouldShowMobileNav && <MobileTabBar />}
    </>
  );
}