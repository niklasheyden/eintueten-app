"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Übersicht', icon: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="13" width="7" height="8"/><rect x="14" y="3" width="7" height="18"/></svg>
  ) },
  { href: '/mini-challenges', label: 'Challenges', icon: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  ) },
  { href: '/observations', label: 'Beobachtungen', icon: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
  ) },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 md:hidden">
      {tabs.map(tab => (
        <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center flex-1">
          <span className={`mb-1 ${pathname === tab.href ? 'text-blue-600' : 'text-gray-500'}`}>{tab.icon}</span>
          <span className={`text-xs ${pathname === tab.href ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
} 