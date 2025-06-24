'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Willkommen bei <span className="text-green-600">Entüten</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Dokumentiere deine nachhaltigen Lebensmittelentscheidungen, schließe Herausforderungen ab und leiste einen positiven Beitrag für die Umwelt.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🥗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Küchen-Check</h3>
              <p className="text-gray-600">
                Dokumentiere deinen Lebensmittelvorrat und verfolge Nachhaltigkeitsmetriken
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mini-Challenges</h3>
              <p className="text-gray-600">
                Schließe spannende Herausforderungen ab, um dein nachhaltiges Essverhalten zu verbessern
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beobachtungen</h3>
              <p className="text-gray-600">Teile deine Erkenntnisse und verfolge deinen Fortschritt im Laufe der Zeit</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="px-8 py-3 text-lg">Jetzt starten</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Anmelden
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
