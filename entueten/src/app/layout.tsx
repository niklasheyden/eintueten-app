import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { QueryProvider } from '@/lib/QueryProvider';
import ConditionalMobileNav from '@/components/ConditionalMobileNav';
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
  title: 'Eintüten - Nachhaltige Lebensmittelerfassung',
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
          <AuthProvider>
            <ConditionalMobileNav />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
