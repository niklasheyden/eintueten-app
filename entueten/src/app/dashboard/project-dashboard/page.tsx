'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/Card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = [
  '#10B981',
  '#3B82F6',
  '#F59E0B',
  '#6366F1',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#F472B6',
  '#F87171',
  '#34D399',
];

export default function ProjectDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    users: 3, // hardcoded for now
    kitchenChecks: 0,
    kitchenItems: 0,
    challengesCompleted: 0,
    observations: 0,
  });
  const [kitchenItems, setKitchenItems] = useState<any[]>([]);
  const [kitchenChecks, setKitchenChecks] = useState<any[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<any[]>([]);
  const [topFoods, setTopFoods] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch actual user count from profiles table
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        // Kitchen check sessions (for line chart)
        const { data: checks, error: checksError } = await supabase
          .from('kitchen_check_sessions')
          .select('*')
          .not('completed_at', 'is', null);
        // Kitchen items (for pie/bar/top foods)
        const { data: items, error: itemsError } = await supabase.from('kitchen_items').select('*');
        // Challenge progress (for bar chart)
        const { data: challenges, error: challengesError } = await supabase
          .from('mini_challenge_progress')
          .select('*')
          .eq('completed', true);
        // Observations (for survey count)
        const { data: obsData, error: obsError } = await supabase
          .from('observations')
          .select('user_id');
        const obsUserIds = obsData ? Array.from(new Set(obsData.map((o: unknown) => (o as any).user_id))) : [];
        // Top 10 foods
        const foodCounts: Record<string, number> = {};
        (items || []).forEach((item: unknown) => {
          if ((item as any).name) foodCounts[(item as any).name] = (foodCounts[(item as any).name] || 0) + 1;
        });
        const topFoodsArr = Object.entries(foodCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setTopFoods(topFoodsArr);
        setKitchenItems(items || []);
        setKitchenChecks(checks || []);
        setChallengeProgress(challenges || []);
        setStats({
          users: userCount || 0,
          kitchenChecks: (checks || []).length,
          kitchenItems: (items || []).length,
          challengesCompleted: (challenges || []).length,
          observations: obsUserIds.length,
        });
      } catch (err: unknown) {
        setError('Fehler beim Laden der Statistiken.');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Pie chart: Herkunft der Lebensmittel
  const totalOrigins = kitchenItems.length;
  const originStats: Record<string, number> = {};
  kitchenItems.forEach((item) => {
    if (item.origin) originStats[item.origin] = (originStats[item.origin] || 0) + 1;
  });
  const originChartData = Object.entries(originStats).map(([name, value], i) => ({
    name,
    value,
    percent: totalOrigins ? Math.round((value / totalOrigins) * 100) : 0,
    color: COLORS[i % COLORS.length],
  }));

  // Bar chart: Lebensmittel pro Kategorie
  const categoryStats: Record<string, number> = {};
  kitchenItems.forEach((item) => {
    if (item.category) categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });
  const categoryChartData = Object.entries(categoryStats).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }));

  // Line chart: Completed challenges per day
  const challengesByDay: Record<string, number> = {};
  challengeProgress.forEach((progress) => {
    if (progress.completed_at) {
      const d = new Date(progress.completed_at);
      const day = d.toISOString().slice(0, 10); // YYYY-MM-DD
      challengesByDay[day] = (challengesByDay[day] || 0) + 1;
    }
  });
  const challengeLineChartData = Object.entries(challengesByDay)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-black mb-2 text-center">Eintüten-Dashboard</h1>
        <p className="text-black mb-8 text-center">
          Übersicht über die wichtigsten Statistiken des Projekts.
        </p>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {loading ? (
          <div className="text-center text-black">Lade...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-2">Registrierte Nutzer</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Abgeschlossene Küchen-Checks
                </h3>
                <p className="text-3xl font-bold text-green-600">{stats.kitchenChecks}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-2">Lebensmittel dokumentiert</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.kitchenItems}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-2">Challenges abgeschlossen</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.challengesCompleted}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-2">Umfragen eingereicht</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.observations}</p>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Herkunft der Lebensmittel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={originChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${percent}%`}
                    >
                      {originChartData.map((entry, index) => (
                        <Cell key={`cell-origin-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value} (${props.payload.percent}%)`,
                        name as string,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Top 10 dokumentierte Lebensmittel
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 font-semibold text-black">Lebensmittel</th>
                        <th className="px-2 py-1 font-semibold text-black">Anzahl</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFoods.map((food, idx) => (
                        <tr key={food.name} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-2 py-1 text-black">{food.name}</td>
                          <td className="px-2 py-1 font-bold text-black">{food.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-8 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Lebensmittel pro Kategorie
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tick={{ fill: '#000', fontWeight: 500 }}
                      height={60}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#000', fontWeight: 500 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 rounded shadow border">
                              <div className="font-semibold text-black mb-1">{label}</div>
                              <div className="text-black">Anzahl: {payload[0].value}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value">
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Abgeschlossene Challenges pro Tag
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={challengeLineChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: '#000', fontWeight: 500 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#000', fontWeight: 500 }} />
                    <Tooltip
                      labelFormatter={(label) => {
                        // Format date as DD.MM.YYYY
                        const d = new Date(label);
                        const formatted = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                        return <span className="text-black font-semibold">{formatted}</span>;
                      }}
                      formatter={(value) => [value, 'Anzahl']}
                    />
                    <Legend formatter={() => 'Anzahl'} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Anzahl"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
