'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

// Import Aargau municipalities data
import aargauMunicipalities from '../../../public/data/aargau_municipalities.json';

// Type for municipality data
interface Municipality {
  id: number;
  name: string;
  zip_codes: string[];
}

const predefinedGroceries = [
  'Tomaten',
  'Brot',
  'Milch',
  'Käse',
  'Äpfel',
  'Kartoffeln',
  'Butter',
  'Joghurt',
  'Karotten',
  'Eier',
  'Reis',
  'Bananen',
  'Fleisch',
  'Fisch',
  'Tofu',
  'Paprika',
  'Salat',
  'Gurke',
  'Zwiebeln',
  'Knoblauch',
  'Linsen',
  'Kichererbsen',
  'Haferflocken',
  'Müsli',
  'Schokolade',
  'Kaffee',
  'Tee',
  'Wurst',
  'Quark',
  'Sahne',
  'Spinat',
  'Pilze',
  'Birnen',
  'Trauben',
  'Orangen',
  'Mandarinen',
  'Honig',
  'Marmelade',
  'Nudeln',
  'Couscous',
  'Polenta',
  'Mais',
  'Erbsen',
  'Walnüsse',
  'Mandeln',
  'Cashews',
  'Sonnenblumenkerne',
  'Kürbiskerne',
  'Olivenöl',
  'Rapsöl',
  'Butter',
  'Margarine',
  'Kekse',
  'Chips',
  'Saft',
  'Wasser',
  'Limo',
  'Cola',
  'Bier',
  'Wein',
];
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
const origins = [
  'aus eigener Gemeinde oder Nachbargemeinde',
  'Kanton Aargau',
  'Schweiz',
  'Anderes Land',
];
const labels = ['Bio', 'IP', 'Regiolabel', 'Fairtrade', 'Anderes', 'Keines'];

// Demo PLZ mapping
const plzToGemeinde: Record<string, string> = {
  '8001': 'Zürich',
  '3000': 'Bern',
  '4000': 'Basel',
  '6003': 'Luzern',
  '9000': 'St. Gallen',
};

const countryList = [
  'Afghanistan',
  'Ägypten',
  'Albanien',
  'Algerien',
  'Andorra',
  'Angola',
  'Antigua und Barbuda',
  'Äquatorialguinea',
  'Argentinien',
  'Armenien',
  'Aserbaidschan',
  'Äthiopien',
  'Australien',
  'Bahamas',
  'Bahrain',
  'Bangladesch',
  'Barbados',
  'Belgien',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivien',
  'Bosnien und Herzegowina',
  'Botswana',
  'Brasilien',
  'Brunei',
  'Bulgarien',
  'Burkina Faso',
  'Burundi',
  'Chile',
  'China',
  'Costa Rica',
  'Dänemark',
  'Deutschland',
  'Dominica',
  'Dominikanische Republik',
  'Dschibuti',
  'Ecuador',
  'El Salvador',
  'Elfenbeinküste',
  'Eritrea',
  'Estland',
  'Eswatini',
  'Fidschi',
  'Finnland',
  'Frankreich',
  'Gabun',
  'Gambia',
  'Georgien',
  'Ghana',
  'Grenada',
  'Griechenland',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Indien',
  'Indonesien',
  'Irak',
  'Iran',
  'Irland',
  'Island',
  'Israel',
  'Italien',
  'Jamaika',
  'Japan',
  'Jemen',
  'Jordanien',
  'Kambodscha',
  'Kamerun',
  'Kanada',
  'Kap Verde',
  'Kasachstan',
  'Katar',
  'Kenia',
  'Kirgisistan',
  'Kiribati',
  'Kolumbien',
  'Komoren',
  'Kongo',
  'Kroatien',
  'Kuba',
  'Kuwait',
  'Laos',
  'Lesotho',
  'Lettland',
  'Libanon',
  'Liberia',
  'Libyen',
  'Liechtenstein',
  'Litauen',
  'Luxemburg',
  'Madagaskar',
  'Malawi',
  'Malaysia',
  'Malediven',
  'Mali',
  'Malta',
  'Marokko',
  'Marshallinseln',
  'Mauretanien',
  'Mauritius',
  'Mexiko',
  'Mikronesien',
  'Moldau',
  'Monaco',
  'Mongolei',
  'Montenegro',
  'Mosambik',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Neuseeland',
  'Nicaragua',
  'Niederlande',
  'Niger',
  'Nigeria',
  'Nordkorea',
  'Nordmazedonien',
  'Norwegen',
  'Oman',
  'Österreich',
  'Osttimor',
  'Pakistan',
  'Palau',
  'Panama',
  'Papua-Neuguinea',
  'Paraguay',
  'Peru',
  'Philippinen',
  'Polen',
  'Portugal',
  'Ruanda',
  'Rumänien',
  'Russland',
  'Salomonen',
  'Sambia',
  'Samoa',
  'San Marino',
  'São Tomé und Príncipe',
  'Saudi-Arabien',
  'Schweden',
  'Schweiz',
  'Senegal',
  'Serbien',
  'Seychellen',
  'Sierra Leone',
  'Simbabwe',
  'Singapur',
  'Slowakei',
  'Slowenien',
  'Somalia',
  'Spanien',
  'Sri Lanka',
  'St. Kitts und Nevis',
  'St. Lucia',
  'St. Vincent und die Grenadinen',
  'Südafrika',
  'Sudan',
  'Südkorea',
  'Südsudan',
  'Suriname',
  'Syrien',
  'Tadschikistan',
  'Tansania',
  'Thailand',
  'Togo',
  'Tonga',
  'Trinidad und Tobago',
  'Tschad',
  'Tschechien',
  'Tunesien',
  'Türkei',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'Ungarn',
  'Uruguay',
  'Usbekistan',
  'Vanuatu',
  'Vatikanstadt',
  'Venezuela',
  'Vereinigte Arabische Emirate',
  'Vereinigte Staaten',
  'Vereinigtes Königreich',
  'Vietnam',
  'Zentralafrikanische Republik',
  'Zypern',
];

const priorityCountryList = [
  'Deutschland',
  'Italien',
  'Frankreich',
  'Spanien',
  'Niederlande',
  'Belgien',
  'Österreich',
  'China',
  'USA',
  'Brasilien',
  'Polen',
  'Marokko',
  'Türkei',
  'Indien',
  'Südafrika',
  'Peru',
  'Thailand',
  'Vietnam',
  'Griechenland',
  'Portugal',
  'Ungarn',
  'Tschechien',
  'Dänemark',
  'Schweden',
  'Norwegen',
  'Finnland',
  'Irland',
  'Vereinigtes Königreich',
  'Russland',
  'Schweiz',
];

export default function KitchenCheckForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState<any>({
    name: '',
    category: '',
    origin: '',
    origin_detail: '',
    label: '',
    purchase_location: '',
  });
  const [showEnoughMessage, setShowEnoughMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grocerySearch, setGrocerySearch] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countryBoxRef = useRef<HTMLDivElement>(null);
  const [municipalitySearch, setMunicipalitySearch] = useState('');
  const [showMunicipalitySuggestions, setShowMunicipalitySuggestions] = useState(false);
  const municipalityInputRef = useRef<HTMLInputElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // For demonstration, set milestone to 2 (in real use, determine by date or prop)
  const milestone = 2;

  // Fetch items from Supabase on mount or when sessionId changes
  useEffect(() => {
    if (!user || !sessionId) return;
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('kitchen_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('added_at', { ascending: true });
      if (error) {
        setError('Fehler beim Laden der Einträge: ' + error.message);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };
    fetchItems();
  }, [user, sessionId]);

  // On mount, ensure there is an open session for the current milestone
  useEffect(() => {
    if (!user) return;
    const ensureSession = async () => {
      // Check for open session for this milestone
      const { data: sessions, error } = await supabase
        .from('kitchen_check_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('milestone', milestone)
        .is('completed_at', null)
        .limit(1);
      if (error) return;
      if (sessions && sessions.length > 0) {
        setSessionId(sessions[0].id);
      } else {
        // Create new session for this milestone
        const { data, error: insertError } = await supabase
          .from('kitchen_check_sessions')
          .insert({ user_id: user.id, milestone })
          .select();
        if (!insertError && data && data[0]) {
          setSessionId(data[0].id);
        }
      }
    };
    ensureSession();
  }, [user, milestone]);

  useEffect(() => {
    if (!showCountrySuggestions) return;
    function handleClickOutside(event: MouseEvent) {
      if (countryBoxRef.current && !countryBoxRef.current.contains(event.target as Node)) {
        setShowCountrySuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountrySuggestions]);

  // Progress bar calculation (now based on items out of 20)
  const itemProgress = Math.min(items.length, 20);

  // Calculate unique categories progress
  const uniqueCategories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);
  const categoryProgress = Math.min(uniqueCategories.length, 5);

  // Validation for 20 items from 5 categories
  const categoriesSet = new Set(items.map((i) => i.category));
  const enoughItems = items.length >= 20 && categoriesSet.size >= 5;

  const resetCurrentItem = () => {
    setCurrentItem({
      name: '',
      category: '',
      origin: '',
      origin_detail: '',
      label: '',
      purchase_location: '',
    });
    setMunicipalitySearch('');
    setCountrySearch('');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteItem = async (idx: number) => {
    const item = items[idx];
    setLoading(true);
    setError(null);
    // Try to delete from Supabase if it has an id (otherwise just remove locally)
    if (item.id) {
      const { error } = await supabase.from('kitchen_items').delete().eq('id', item.id);
      if (error) {
        setError('Fehler beim Löschen: ' + error.message);
        setLoading(false);
        return;
      }
    }
    setItems(items.filter((_, i) => i !== idx));
    setLoading(false);
  };

  const handleEditItem = (idx: number) => {
    setEditIndex(idx);
    setCurrentItem(items[idx]);
  };

  const handleAddOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sessionId) return;
    setLoading(true);
    setError(null);
    if (editIndex !== null) {
      // Update existing
      const item = items[editIndex];
      let updatedId = item.id;
      if (item.id) {
        const { data, error } = await supabase
          .from('kitchen_items')
          .update({
            name: currentItem.name,
            category: currentItem.category,
            origin: currentItem.origin,
            origin_detail: currentItem.origin_detail,
            label: currentItem.label,
            purchase_location: currentItem.purchase_location,
            session_id: sessionId,
          })
          .eq('id', item.id)
          .select();
        if (error) {
          setError('Fehler beim Aktualisieren: ' + error.message);
          setLoading(false);
          return;
        }
        if (data && data[0] && data[0].id) updatedId = data[0].id;
      }
      const updated = [...items];
      updated[editIndex] = { ...currentItem, id: updatedId, session_id: sessionId };
      setItems(updated);
      setEditIndex(null);
      resetCurrentItem();
      setGrocerySearch('');
      setLoading(false);
      return;
    }
    // Add new
    const { data, error } = await supabase
      .from('kitchen_items')
      .insert({
        user_id: user.id,
        name: currentItem.name,
        category: currentItem.category,
        origin: currentItem.origin,
        origin_detail: currentItem.origin_detail,
        label: currentItem.label,
        purchase_location: currentItem.purchase_location,
        session_id: sessionId,
      })
      .select();
    if (error) {
      setError('Fehler beim Speichern: ' + error.message);
    } else {
      setItems([
        ...items,
        { ...currentItem, id: data && data[0] && data[0].id, session_id: sessionId },
      ]);
      resetCurrentItem();
      setGrocerySearch('');
      if (
        !showEnoughMessage &&
        items.length + 1 >= 20 &&
        new Set([...categoriesSet, currentItem.category]).size >= 5
      ) {
        setShowEnoughMessage(true);
      }
    }
    setLoading(false);
  };

  // Deduplicate groceries
  const uniqueGroceries = Array.from(new Set(predefinedGroceries));

  // Filter groceries for combobox
  const filteredGroceries = grocerySearch
    ? uniqueGroceries.filter((g) => g.toLowerCase().includes(grocerySearch.toLowerCase()))
    : uniqueGroceries;

  // Filter countries for autocomplete
  let filteredCountries: string[] = [];
  if (countrySearch) {
    const searchLower = countrySearch.toLowerCase();
    const priorityMatches = priorityCountryList.filter((c) =>
      c.toLowerCase().includes(searchLower),
    );
    const otherMatches = countryList.filter(
      (c) => c.toLowerCase().includes(searchLower) && !priorityMatches.includes(c),
    );
    filteredCountries = [...priorityMatches, ...otherMatches];
  } else {
    filteredCountries = [
      ...priorityCountryList,
      ...countryList.filter((c) => !priorityCountryList.includes(c)),
    ].slice(0, 10);
  }

  // Filter municipalities for autocomplete
  const filteredMunicipalities = municipalitySearch
    ? (aargauMunicipalities as Municipality[]).filter(
        (m: Municipality) =>
          m.name.toLowerCase().includes(municipalitySearch.toLowerCase()) ||
          m.zip_codes.some((zip: string) => zip.includes(municipalitySearch)),
      )
    : (aargauMunicipalities as Municipality[]).slice(0, 10);

  // Click outside handler for municipality suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        municipalityInputRef.current &&
        !municipalityInputRef.current.contains(event.target as Node)
      ) {
        setShowMunicipalitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onSignOut={handleSignOut} />
        <div className="w-full max-w-full px-2 sm:max-w-2xl sm:px-2 mx-auto py-4">
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Küchencheck</h2>
            {/* Sticky progress bar */}
            <div
              className="sticky top-0 z-10 bg-white rounded-t-lg shadow-sm mb-4 pb-2 pt-2 px-6"
              style={{ marginLeft: '-1.5rem', marginRight: '-1.5rem' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-900">
                  {items.length < 20
                    ? `${items.length} von 20 Einträgen hinzugefügt`
                    : `${items.length} Einträge hinzugefügt`}
                </span>
              </div>
              <div className="flex w-full gap-0.5 mb-1">
                {[...Array(20)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded ${idx < items.length ? 'bg-blue-600' : 'bg-gray-200'} transition-all duration-300`}
                  ></div>
                ))}
              </div>
              {/* Category progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900">
                    Kategorien: {categoryProgress}/5
                  </span>
                </div>
                <div className="flex w-full gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-2 rounded ${idx < categoryProgress ? 'bg-blue-600' : 'bg-gray-200'} transition-all duration-300`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <form onSubmit={handleAddOrUpdateItem} className="space-y-6">
              {/* Row 1: Lebensmittelname combobox */}
              <div>
                <label className="block text-gray-900 font-medium mb-1">Lebensmittelname *</label>
                <div className="relative">
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none"
                    placeholder="z.B. Tomaten"
                    value={currentItem.name}
                    onChange={(e) => {
                      setCurrentItem({ ...currentItem, name: e.target.value });
                      setGrocerySearch(e.target.value);
                    }}
                    required
                  />
                </div>
                {/* Tag-style suggestions */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {filteredGroceries.slice(0, 8).map((g) => (
                    <button
                      type="button"
                      key={g}
                      className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${currentItem.name === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-blue-100'}`}
                      onClick={() => setCurrentItem({ ...currentItem, name: g })}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {/* Row 2: Category grid */}
              <div>
                <label className="block text-gray-900 font-medium mb-1">Kategorie *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.key}
                      className={`flex flex-col items-center justify-center border rounded-xl px-2 py-4 text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm hover:shadow-md ${currentItem.category === cat.key ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-white border-gray-200 text-gray-900'}`}
                      onClick={() =>
                        setCurrentItem({
                          ...currentItem,
                          category: currentItem.category === cat.key ? '' : cat.key,
                        })
                      }
                    >
                      <span className="text-3xl mb-1">{cat.icon}</span>
                      <span className="text-center text-sm font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Row 3: Herkunft dropdown */}
              <div>
                <label className="block text-gray-900 font-medium mb-1">
                  Woher kommt das Lebensmittel? *
                </label>
                <div className="relative">
                  <select
                    className="border rounded px-3 py-2 w-full text-gray-900 bg-white appearance-none pr-10 focus:ring-2 focus:ring-blue-500"
                    value={currentItem.origin}
                    onChange={(e) => setCurrentItem({ ...currentItem, origin: e.target.value })}
                    required
                  >
                    <option value="">Herkunft wählen</option>
                    {origins.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              {/* Row 4: Gemeindename/PLZ or country autocomplete */}
              {currentItem.origin === 'Anderes Land' ? (
                <div ref={countryBoxRef}>
                  <label className="block text-gray-900 font-medium mb-1">Land auswählen *</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none"
                      placeholder="Land suchen..."
                      value={countrySearch || currentItem.origin_detail || ''}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setCurrentItem({ ...currentItem, origin_detail: '' });
                        setShowCountrySuggestions(true);
                      }}
                      onFocus={() => setShowCountrySuggestions(true)}
                      required
                    />
                    {showCountrySuggestions && filteredCountries.length > 0 && (
                      <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow mt-1 max-h-48 overflow-auto">
                        {filteredCountries.map((country) => (
                          <button
                            type="button"
                            key={country}
                            className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-900"
                            onClick={() => {
                              setCurrentItem({ ...currentItem, origin_detail: country });
                              setCountrySearch(country);
                              setShowCountrySuggestions(false);
                            }}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-900 font-medium mb-1">
                    Hast du bei CH Produkten die genaue Ortsangabe? (Gemeindename oder PLZ)
                  </label>
                  <div className="relative" ref={municipalityInputRef}>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none"
                      placeholder="Gemeindename oder PLZ eingeben..."
                      value={municipalitySearch || currentItem.origin_detail || ''}
                      onChange={(e) => {
                        setMunicipalitySearch(e.target.value);
                        setCurrentItem({ ...currentItem, origin_detail: '' });
                        setShowMunicipalitySuggestions(true);
                      }}
                      onFocus={() => setShowMunicipalitySuggestions(true)}
                    />
                    {showMunicipalitySuggestions && filteredMunicipalities.length > 0 && (
                      <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow mt-1 max-h-48 overflow-auto">
                        {filteredMunicipalities.map((municipality: Municipality) => (
                          <button
                            type="button"
                            key={municipality.id}
                            className="block w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-900"
                            onClick={() => {
                              const displayValue = `${municipality.name} (${municipality.zip_codes.join(', ')})`;
                              setCurrentItem({ ...currentItem, origin_detail: displayValue });
                              setMunicipalitySearch(displayValue);
                              setShowMunicipalitySuggestions(false);
                            }}
                          >
                            <div className="font-medium">{municipality.name}</div>
                            <div className="text-sm text-gray-600">
                              PLZ: {municipality.zip_codes.join(', ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Row 5: Produktionsart/Label dropdown */}
              <div>
                <label className="block text-gray-900 font-medium mb-1">
                  Produktionsart/Label angeben (optional)
                </label>
                <div className="relative">
                  <select
                    className="border rounded px-3 py-2 w-full text-gray-900 bg-white appearance-none pr-10 focus:ring-2 focus:ring-blue-500"
                    value={currentItem.label}
                    onChange={(e) => setCurrentItem({ ...currentItem, label: e.target.value })}
                  >
                    <option value="">Produktionsart/Label wählen</option>
                    {labels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              {/* Row 6: Einkaufsort */}
              <div>
                <label className="block text-gray-900 font-medium mb-1">
                  Einkaufsort eingeben (optional)
                </label>
                <Input
                  type="text"
                  className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none"
                  placeholder="Einkaufsort"
                  value={currentItem.purchase_location}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, purchase_location: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  disabled={
                    loading || !currentItem.name || !currentItem.category || !currentItem.origin
                  }
                >
                  {editIndex !== null ? 'Änderungen speichern' : 'Hinzufügen'}
                </Button>
              </div>
            </form>
          </Card>
          {showEnoughMessage && (
            <div className="bg-green-100 text-green-800 p-4 rounded mb-4 text-center font-semibold">
              Du hast genügend Einträge gemacht. Mehr Einträge sind möglich aber nicht erforderlich.
            </div>
          )}
          {enoughItems && sessionId && (
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  setLoading(true);
                  await supabase
                    .from('kitchen_check_sessions')
                    .update({ completed_at: new Date().toISOString() })
                    .eq('id', sessionId);
                  setLoading(false);
                  router.push('/dashboard');
                }}
              >
                Fertigstellen
              </Button>
            </div>
          )}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">
              Bisherige Einträge ({items.length})
            </h2>
            <div className="grid gap-3">
              {items.map((item, idx) => {
                const cat = categories.find((c) => c.key === item.category);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12">
                        <span className="text-2xl">{cat?.icon}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">{item.name}</div>
                        <div className="text-sm text-gray-700">{item.origin}</div>
                        {item.purchase_location && (
                          <div className="text-xs text-gray-500">{item.purchase_location}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-blue-100"
                        title="Bearbeiten"
                        onClick={() => handleEditItem(idx)}
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path d="M15 5l4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-red-100"
                        title="Löschen"
                        onClick={() => handleDeleteItem(idx)}
                      >
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 6h18" strokeLinecap="round" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                          <rect x="5" y="6" width="14" height="14" rx="2" />
                          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
