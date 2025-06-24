'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import challengesData from '@/data/challenges.json';
import React from 'react';

// Add categories array for icon lookup (copy from kitchen-check/step1/page.tsx)
const categories = [
  { key: 'Früchte', label: 'Früchte', icon: '🍎' },
  { key: 'Gemüse', label: 'Gemüse', icon: '🥦' },
  { key: 'Milchprodukte', label: 'Milchprodukte', icon: '🥛' },
  { key: 'Eier', label: 'Eier', icon: '🥚' },
  { key: 'Fleisch', label: 'Fleisch', icon: '🥩' },
  { key: 'Fisch und Meeresfrüchte', label: 'Fisch & Meer', icon: '🐟' },
  { key: 'Getreideprodukte', label: 'Getreide', icon: '🍞' },
  { key: 'Hülsenfrüchte (inkl. Tofu)', label: 'Hülsenfrüchte', icon: '🌱' },
  { key: 'Nüsse und Samen', label: 'Nüsse & Samen', icon: '🥜' },
  { key: 'Öle und Fette', label: 'Öle & Fette', icon: '🫒' },
  { key: 'Andere', label: 'Andere', icon: '🛒' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kitchenItems, setKitchenItems] = useState<any[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [kitchenCheckSessions, setKitchenCheckSessions] = useState<any[]>([]);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [modalSession, setModalSession] = useState<any | null>(null);

  const PROJECT_START = new Date('2025-09-01T00:00:00Z');
  const DAY_1 = new Date(PROJECT_START);
  const DAY_29 = new Date(PROJECT_START.getTime() + 28 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch kitchen check sessions
        const { data: sessions, error: sessionError } = await supabase
          .from('kitchen_check_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: true });
        if (sessionError) throw sessionError;
        setKitchenCheckSessions(sessions || []);
        // Fetch kitchen items
        const { data: kitchen, error: kitchenError } = await supabase
          .from('kitchen_items')
          .select('*')
          .eq('user_id', user.id);
        if (kitchenError) throw kitchenError;
        setKitchenItems(kitchen || []);
        // Fetch challenge progress
        const { data: challenges, error: challengeError } = await supabase
          .from('mini_challenge_progress')
          .select('*')
          .eq('user_id', user.id);
        if (challengeError) throw challengeError;
        setChallengeProgress(challenges || []);
        // Fetch observations
        const { data: obs, error: obsError } = await supabase
          .from('observations')
          .select('*')
          .eq('user_id', user.id);
        if (obsError) throw obsError;
        setObservations(obs || []);
      } catch (err: any) {
        setError('Fehler beim Laden der Daten.');
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Robust kitchen check completion logic
  function isSessionComplete(session: any) {
    const items = kitchenItems.filter(item => item.session_id === session.id);
    const categories = new Set(items.map(i => i.category));
    return (
      !!session.completed_at &&
      items.length >= 20 &&
      categories.size >= 5
    );
  }

  // Find completed sessions
  const completedSessions = kitchenCheckSessions.filter(isSessionComplete);
  const completedKitchenChecks = completedSessions.length;
  const lastCompletedCheckDate = completedSessions.length > 0 ? completedSessions[completedSessions.length - 1].completed_at : null;

  // Find in-progress session (not completed, has items)
  const inProgressSession = kitchenCheckSessions.find(session => {
    if (session.completed_at) return false;
    const items = kitchenItems.filter(item => item.session_id === session.id);
    return items.length > 0;
  });
  const inProgressCheck = !!inProgressSession;
  const inProgressCount = inProgressSession ? kitchenItems.filter(item => item.session_id === inProgressSession.id).length : 0;

  // Küchen-Check stats
  const kitchenCheckCount = kitchenItems.length > 0 ? 1 : 0; // You can improve this if you track sessions
  const lastKitchenCheck = kitchenItems.length > 0 ? kitchenItems[kitchenItems.length - 1].added_at : null;
  // Aggregate kitchen item categories
  const kitchenCategoryStats = kitchenItems.reduce(
    (acc, item) => {
      if (item.category === 'local') acc.local++;
      if (item.category === 'organic') acc.organic++;
      if (item.category === 'seasonal') acc.seasonal++;
      return acc;
    },
    { local: 0, organic: 0, seasonal: 0 }
  );

  // Challenge stats
  const totalChallenges = Array.isArray(challengesData) ? challengesData.length : 0;
  const completedChallenges = challengeProgress.filter((c) => c.completed).length;
  const percentChallenges = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

  // Challenge chart data
  const challengeChartData = [
    { name: 'Abgeschlossen', value: completedChallenges, color: '#10B981' },
    { name: 'Offen', value: Math.max(totalChallenges - completedChallenges, 0), color: '#F59E0B' },
  ];

  // Beobachtungen stats
  const observationCount = observations.length;
  const lastObservation = observations.length > 0 ? observations[observations.length - 1].observed_at : null;

  // Beobachtungen chart data (by category)
  const obsCategoryStats: Record<string, number> = {};
  observations.forEach((o) => {
    obsCategoryStats[o.category] = (obsCategoryStats[o.category] || 0) + 1;
  });
  const obsChartData = Object.entries(obsCategoryStats).map(([name, value], i) => ({
    name,
    value,
    color: ['#3B82F6', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981'][i % 5],
  }));

  // Letzte Aktivitäten
  const recentActivities = [
    completedKitchenChecks > 0 && lastCompletedCheckDate && {
      type: 'kitchen',
      title: 'Küchen-Check abgeschlossen',
      desc: `${kitchenItems.length} Lebensmittel dokumentiert`,
      date: lastCompletedCheckDate,
    },
    inProgressCheck && {
      type: 'kitchen-inprogress',
      title: 'Küchen-Check in Bearbeitung',
      desc: `${inProgressCount}/20 Einträge`,
      date: kitchenItems.length > 0 ? kitchenItems[kitchenItems.length - 1].added_at : null,
      action: () => router.push('/kitchen-check/'),
    },
    challengeProgress.length > 0 && {
      type: 'challenge',
      title: 'Challenge abgeschlossen',
      desc: `${completedChallenges} Challenges abgeschlossen`,
      date: challengeProgress.reduce((latest, c) => c.completed_at && (!latest || c.completed_at > latest) ? c.completed_at : latest, null),
    },
    lastObservation && {
      type: 'observation',
      title: 'Umfrage abgeschickt',
      desc: `${observationCount} Beobachtungen`,
      date: lastObservation,
    },
  ].filter(Boolean).sort((a, b) => (a!.date > b!.date ? -1 : 1));

  // Find kitchen check completions (now using robust logic)
  const sessionDates = completedSessions.map((s) => new Date(s.completed_at)).sort((a, b) => a.getTime() - b.getTime());
  const kitchenCheck1 = sessionDates[0];
  const kitchenCheck2 = sessionDates[1];
  // Survey completion: any observation exists
  const surveyDone = observations.length > 0 ? new Date(observations[0].observed_at) : undefined;

  // Milestone UI helper
  const milestoneStatus = (done: boolean, date: Date | undefined, label: string, action: () => void, isFirstMilestone?: boolean, session?: any) => (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg mb-4 ${done ? 'bg-green-50' : 'bg-yellow-50'}`}>
      <div className="flex items-center">
        {done ? (
          <span className="inline-flex items-center justify-center w-8 h-8 mr-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-8 h-8 mr-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
        )}
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-700">
            {done ? `Abgeschlossen am ${date ? date.toLocaleDateString('de-DE') : ''}` : 'Noch nicht abgeschlossen'}
          </p>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 w-full sm:w-auto">
        {done ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto"
            onClick={() => openItemsModal(session)}
          >
            Check ansehen
          </button>
        ) : (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full sm:w-auto"
            onClick={action}
          >
            {isFirstMilestone && inProgressCheck ? 'Fortsetzen' : 'Jetzt starten'}
          </button>
        )}
      </div>
    </div>
  );

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    const now = new Date();
    // Zero out the time for both dates
    const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.floor((nowDay.getTime() - dDay.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'heute';
    if (diff === 1) return 'gestern';
    return `vor ${diff} Tagen`;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Find the first and second completed kitchen check sessions
  const firstSession = completedSessions[0];
  const secondSession = completedSessions[1];

  function getOriginChartData(items: any[]) {
    const EU_COUNTRIES = [
      'Belgien', 'Bulgarien', 'Dänemark', 'Deutschland', 'Estland', 'Finnland', 'Frankreich', 'Griechenland', 'Irland', 'Italien', 'Kroatien', 'Lettland', 'Litauen', 'Luxemburg', 'Malta', 'Niederlande', 'Österreich', 'Polen', 'Portugal', 'Rumänien', 'Schweden', 'Slowakei', 'Slowenien', 'Spanien', 'Tschechien', 'Ungarn', 'Zypern'
    ];
    const originStats = { Lokal: 0, 'Kt. Aargau': 0, CH: 0, EU: 0, Übersee: 0 };
    items.forEach(item => {
      if (item.origin === 'aus eigener Gemeinde oder Nachbargemeinde') originStats.Lokal++;
      else if (item.origin === 'Kanton Aargau') originStats['Kt. Aargau']++;
      else if (item.origin === 'Schweiz') originStats.CH++;
      else if (item.origin === 'Anderes Land') {
        if (item.origin_detail && EU_COUNTRIES.some(c => item.origin_detail.includes(c))) originStats.EU++;
        else originStats.Übersee++;
      }
    });
    return [
      { name: 'Lokal', value: originStats.Lokal, color: '#10B981' },
      { name: 'Kt. Aargau', value: originStats['Kt. Aargau'], color: '#3B82F6' },
      { name: 'CH', value: originStats.CH, color: '#F59E0B' },
      { name: 'EU', value: originStats.EU, color: '#6366F1' },
      { name: 'Übersee', value: originStats.Übersee, color: '#EF4444' },
    ];
  }

  const firstSessionItems = firstSession ? kitchenItems.filter(item => item.session_id === firstSession.id) : [];
  const secondSessionItems = secondSession ? kitchenItems.filter(item => item.session_id === secondSession.id) : [];
  const firstOriginChartData = getOriginChartData(firstSessionItems);
  const secondOriginChartData = getOriginChartData(secondSessionItems);

  function openItemsModal(session: any) {
    setModalSession(session);
    setShowItemsModal(true);
  }
  function closeItemsModal() {
    setShowItemsModal(false);
    setModalSession(null);
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onSignOut={handleSignOut} />

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Übersicht</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading && <div className="text-center text-gray-500 mb-4">Lade...</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Küchen-Checks insgesamt</h3>
              <p className="text-3xl font-bold text-blue-600">{completedKitchenChecks}</p>
              {inProgressCheck && (
                <div className="text-sm text-yellow-700 mt-2 flex items-center gap-2">
                  <span>Küchen-Check in Bearbeitung ({inProgressCount}/20 Einträge)</span>
                  <button className="ml-2 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" onClick={() => router.push('/kitchen-check/')}>Fortsetzen</button>
                </div>
              )}
              <p className="text-sm text-gray-600">Letzter Check: {formatDate(lastCompletedCheckDate)}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Abgeschlossene Challenges</h3>
              <p className="text-3xl font-bold text-green-600">{completedChallenges}</p>
              <p className="text-sm text-gray-600">{percentChallenges}% abgeschlossen</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lebensmittel insgesamt</h3>
              <p className="text-3xl font-bold text-purple-600">{kitchenItems.length}</p>
              <p className="text-sm text-gray-600">Alle Einträge</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Projekt-Meilensteine</h3>
              {milestoneStatus(!!kitchenCheck1, kitchenCheck1, 'Küchen-Check 1 (Tag 1)', () => router.push('/kitchen-check/'), true, firstSession)}
              {milestoneStatus(!!kitchenCheck2, kitchenCheck2, 'Küchen-Check 2 (Tag 29)', () => router.push('/kitchen-check/'), false, secondSession)}
              {milestoneStatus(!!surveyDone, surveyDone, 'Abschluss-Umfrage (Tag 29)', () => router.push('/observations'))}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Herkunft der Lebensmittel {secondSession ? '(Küchen-Check 1 & 2)' : '(Küchen-Check 1)'}</h3>
              {firstSession ? (
                <div className={`flex ${secondSession ? 'flex-col md:flex-row gap-8' : 'flex-col'}`}>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2 font-semibold">Küchen-Check 1</p>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={firstOriginChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {firstOriginChartData.map((entry, index) => (
                            <Cell key={`cell-origin1-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {secondSession && (
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-2 font-semibold">Küchen-Check 2</p>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={secondOriginChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            animationDuration={1000}
                          >
                            {secondOriginChartData.map((entry, index) => (
                              <Cell key={`cell-origin2-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-56 text-gray-400">
                  <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h.01M12 16h.01M16 12h.01" /></svg>
                  <p className="text-lg">Noch kein Küchen-Check abgeschlossen</p>
                  <p className="text-sm">Starte deinen ersten Check, um die Herkunft deiner Lebensmittel zu sehen.</p>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
              <div className="space-y-4">
                {recentActivities.length === 0 && <div className="text-gray-500">Keine Aktivitäten gefunden.</div>}
                {recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      activity.type === 'kitchen'
                        ? 'bg-green-50'
                        : activity.type === 'kitchen-inprogress'
                        ? 'bg-yellow-50'
                        : activity.type === 'challenge'
                        ? 'bg-blue-50'
                        : 'bg-purple-50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-900">{activity.desc}</p>
                    </div>
                    {activity.type !== 'kitchen-inprogress' && (
                      <span className="text-sm text-gray-700">{formatDate(activity.date)}</span>
                    )}
                    {activity.type === 'kitchen-inprogress' && (
                      <button className="ml-4 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" onClick={activity.action}>Fortsetzen</button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Modal for kitchen check items */}
        {showItemsModal && modalSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={closeItemsModal}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Deine Einträge ({kitchenItems.filter(i => i.session_id === modalSession.id).length})</h2>
              <div className="max-h-96 overflow-y-auto">
                {kitchenItems.filter(i => i.session_id === modalSession.id).length === 0 ? (
                  <div className="text-gray-500">Keine Einträge gefunden.</div>
                ) : (
                  <div className="grid gap-3">
                    {kitchenItems.filter(i => i.session_id === modalSession.id).map((item, idx) => {
                      const cat = categories.find(c => c.key === item.category);
                      return (
                        <div key={item.id || idx} className="flex items-center justify-between bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12">
                              <span className="text-2xl">{cat?.icon}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-base">{item.name}</div>
                              <div className="text-sm text-gray-700">{item.origin}</div>
                              {item.purchase_location && <div className="text-xs text-gray-500">{item.purchase_location}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
 