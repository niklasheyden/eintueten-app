import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { QueryProvider } from '@/lib/QueryProvider';
import MobileTabBar from '@/components/MobileTabBar';
import Image from 'next/image';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Entüten - Nachhaltige Lebensmittelerfassung',
  description:
    'Dokumentiere deine nachhaltigen Lebensmittelentscheidungen und schließe Herausforderungen ab',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {/* Mobile header with logo */}
          <div className="md:hidden flex items-center h-14 border-b border-gray-200 bg-white sticky top-0 z-40 pl-4">
            <span className="font-bold text-lg text-gray-800">Eintüten</span>
          </div>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <MobileTabBar />
      </body>
    </html>
  );
}
