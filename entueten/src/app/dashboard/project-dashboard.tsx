'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/Card';

export default function ProjectDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    users: 0,
    kitchenChecks: 0,
    kitchenItems: 0,
    challengesCompleted: 0,
    observations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        // Total kitchen check sessions completed
        const { count: kitchenChecks } = await supabase
          .from('kitchen_check_sessions')
          .select('*', { count: 'exact', head: true })
          .neq('completed_at', null);
        // Total kitchen items
        const { count: kitchenItems } = await supabase
          .from('kitchen_items')
          .select('*', { count: 'exact', head: true });
        // Total challenges completed
        const { count: challengesCompleted } = await supabase
          .from('mini_challenge_progress')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true);
        // Total observation surveys (distinct users)
        const { data: obsData, error: obsError } = await supabase
          .from('observations')
          .select('user_id', { count: 'exact' });
        const obsUserIds = obsData ? Array.from(new Set(obsData.map((o: unknown) => (o as any).user_id))) : [];
        setStats({
          users: userCount || 0,
          kitchenChecks: kitchenChecks || 0,
          kitchenItems: kitchenItems || 0,
          challengesCompleted: challengesCompleted || 0,
          observations: obsUserIds.length,
        });
      } catch (err: unknown) {
        setError('Fehler beim Laden der Statistiken.');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Projekt-Dashboard</h1>
        <p className="text-gray-600 mb-8 text-center">
          Übersicht über die wichtigsten Statistiken des Projekts (alle Nutzer).
        </p>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-500">Lade...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrierte Nutzer</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Abgeschlossene Küchen-Checks
              </h3>
              <p className="text-3xl font-bold text-green-600">{stats.kitchenChecks}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lebensmittel dokumentiert
              </h3>
              <p className="text-3xl font-bold text-purple-600">{stats.kitchenItems}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenges abgeschlossen</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.challengesCompleted}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Umfragen eingereicht</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.observations}</p>
            </Card>
          </div>
        )}
        <div className="mt-8 text-center text-gray-400 text-sm">
          TODO: Weitere Auswertungen, Diagramme, Filter, Export etc.
        </div>
      </div>
    </div>
  );
}
