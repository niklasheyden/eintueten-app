import Link from 'next/link';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from './Button';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rawPathname = usePathname();
  const pathname = rawPathname || '';

  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between relative">
      <div className="font-bold">Entüten</div>
      {/* Desktop links */}
      <div className="hidden md:flex items-center space-x-4">
        <Link
          href="/dashboard"
          className={`hover:underline ${pathname === '/dashboard' ? 'underline font-bold text-blue-400' : ''}`}
        >
          Übersicht
        </Link>
        {/* <Link href="/kitchen-check/step1" className="hover:underline">
          Küchen-Check
        </Link> */}
        <Link
          href="/mini-challenges"
          className={`hover:underline ${pathname.startsWith('/mini-challenges') ? 'underline font-bold text-blue-400' : ''}`}
        >
          Mini-Challenges
        </Link>
        <Link
          href="/observations"
          className={`hover:underline ${pathname.startsWith('/observations') ? 'underline font-bold text-blue-400' : ''}`}
        >
          Beobachtungen
        </Link>
        {user && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onSignOut}
              className="text-white border-white hover:bg-white hover:text-gray-800"
            >
              Abmelden
            </Button>
          </div>
        )}
      </div>
      {/* Burger menu button */}
      <button
        className="md:hidden flex items-center px-2 py-1 focus:outline-none"
        aria-label="Menü öffnen"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-800 shadow-lg z-50 md:hidden animate-fade-in">
          <div className="flex flex-col space-y-2 p-4">
            <Link
              href="/dashboard"
              className={`hover:underline ${pathname === '/dashboard' ? 'underline font-bold text-blue-400' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Übersicht
            </Link>
            {/* <Link href="/kitchen-check/step1" className="hover:underline" onClick={() => setMenuOpen(false)}>
              Küchen-Check
            </Link> */}
            <Link
              href="/mini-challenges"
              className={`hover:underline ${pathname.startsWith('/mini-challenges') ? 'underline font-bold text-blue-400' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Mini-Challenges
            </Link>
            <Link
              href="/observations"
              className={`hover:underline ${pathname.startsWith('/observations') ? 'underline font-bold text-blue-400' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Beobachtungen
            </Link>
            {user && (
              <div className="flex flex-col space-y-2 border-t border-gray-700 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  className="text-white border-white hover:bg-white hover:text-gray-800"
                >
                  Abmelden
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
 