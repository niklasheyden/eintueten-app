'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import challengesData from '@/data/challenges.json';
import { supabase } from '@/lib/supabaseClient';

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  points: number;
  requireProofText?: boolean;
  requireProofImage?: boolean;
}

interface UserChallenge {
  challengeId: number;
  completed: boolean;
  completedAt?: string;
  proofPhoto?: string;
  id?: string; // Supabase row id
  proofText?: string;
}

export default function MiniChallengesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [challenges] = useState<Challenge[]>(challengesData);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [showProofAlert, setShowProofAlert] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('mini_challenge_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        setError('Fehler beim Laden des Fortschritts.');
      } else {
        setUserChallenges(
          (data || []).map((item: any) => ({
            id: item.id,
            challengeId: parseInt(item.challenge_id, 10),
            completed: item.completed,
            completedAt: item.completed_at,
            proofText: item.proof_text,
            proofPhoto: item.proof_photo,
          }))
        );
      }
      setLoading(false);
    };
    fetchProgress();
  }, [user]);

  const getUserChallenge = (challengeId: number) => {
    return userChallenges.find((uc) => uc.challengeId === challengeId);
  };

  const markAsCompleted = async (challengeId: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    let uploadedImageUrl = '';
    if (proofImage) {
      const fileExt = proofImage.name.split('.').pop();
      const fileName = `${user.id}_${challengeId}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('challenge-proofs').upload(fileName, proofImage);
      if (uploadError) {
        setError('Fehler beim Hochladen des Bildes.');
        setLoading(false);
        return;
      }
      uploadedImageUrl = supabase.storage.from('challenge-proofs').getPublicUrl(fileName).data.publicUrl;
    }
    // Check if already exists
    const existing = userChallenges.find((uc) => uc.challengeId === challengeId);
    let result;
    if (existing) {
      result = await supabase
        .from('mini_challenge_progress')
        .update({ completed: true, completed_at: new Date().toISOString(), proof_text: proofText, proof_photo: uploadedImageUrl })
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select();
    } else {
      result = await supabase
        .from('mini_challenge_progress')
        .insert({
          user_id: user.id,
          challenge_id: challengeId.toString(),
          completed: true,
          completed_at: new Date().toISOString(),
          proof_text: proofText,
          proof_photo: uploadedImageUrl,
        })
        .select();
    }
    if (result.error) {
      setError('Fehler beim Speichern des Fortschritts.');
    } else {
      // Refresh progress
      const { data } = await supabase
        .from('mini_challenge_progress')
        .select('*')
        .eq('user_id', user.id);
      setUserChallenges(
        (data || []).map((item: any) => ({
          id: item.id,
          challengeId: parseInt(item.challenge_id, 10),
          completed: item.completed,
          completedAt: item.completed_at,
          proofText: item.proof_text,
          proofPhoto: item.proof_photo,
        }))
      );
      setShowModal(false);
      setProofText('');
      setProofImage(null);
      setProofImageUrl('');
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diet':
        return 'bg-blue-100 text-blue-800';
      case 'shopping':
        return 'bg-purple-100 text-purple-800';
      case 'cooking':
        return 'bg-orange-100 text-orange-800';
      case 'sustainability':
        return 'bg-green-100 text-green-800';
      case 'gardening':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add German translations for category and difficulty
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'diet': return 'Ernährung';
      case 'shopping': return 'Einkaufen';
      case 'cooking': return 'Kochen';
      case 'sustainability': return 'Nachhaltigkeit';
      case 'gardening': return 'Garten';
      default: return category;
    }
  };
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Einfach';
      case 'medium': return 'Mittel';
      case 'hard': return 'Schwierig';
      default: return difficulty;
    }
  };

  const completedCount = userChallenges.filter((uc) => uc.completed).length;
  const totalPoints = userChallenges
    .filter((uc) => uc.completed)
    .reduce((sum, uc) => {
      const challenge = challenges.find((c) => c.id === uc.challengeId);
      return sum + (challenge?.points || 0);
    }, 0);

  // Find the selected challenge's proof requirements
  const requireProofText = selectedChallenge?.requireProofText;
  const requireProofImage = selectedChallenge?.requireProofImage;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onSignOut={handleSignOut} />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mini-Challenges</h1>
            <p className="text-gray-600">
              Schließe Challenges ab, um dein nachhaltiges Essverhalten zu verbessern
            </p>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading && (
            <div className="text-center text-gray-500 mb-4">Lade...</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Abgeschlossene Challenges</h3>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-gray-600">von {challenges.length}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gesamtpunkte</h3>
              <p className="text-3xl font-bold text-blue-600">{totalPoints}</p>
              <p className="text-sm text-gray-600">erreichte Punkte</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Abschlussrate</h3>
              <p className="text-3xl font-bold text-purple-600">
                {challenges.length > 0 ? Math.round((completedCount / challenges.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">der Challenges abgeschlossen</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => {
              const userChallenge = getUserChallenge(challenge.id);
              const isCompleted = userChallenge?.completed;

              return (
                <Card key={challenge.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(challenge.category)}`}
                    >
                      {getCategoryLabel(challenge.category)}
                    </span>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}
                    >
                      {getDifficultyLabel(challenge.difficulty)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">⏱ {challenge.estimatedTime}</span>
                    <span className="text-sm font-medium text-green-600">
                      +{challenge.points} pts
                    </span>
                  </div>

                  {isCompleted ? (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-semibold">{challenge.title}</span>
                        <span className="text-green-600 text-sm">
                          {userChallenge.completedAt &&
                            new Date(userChallenge.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-900 mt-2">Abgeschlossen!</div>
                      {userChallenge.proofText && (
                        <div className="mt-2 text-gray-900 text-sm"><b>Nachweis:</b> {userChallenge.proofText}</div>
                      )}
                      {userChallenge.proofPhoto && (
                        <img src={userChallenge.proofPhoto} alt="Nachweis" className="mt-2 max-h-32 rounded" />
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setShowModal(true);
                      }}
                      className="w-full"
                      disabled={loading}
                    >
                      Challenge starten
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Completion Modal */}
        {showModal && selectedChallenge && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Challenge abschließen?</h2>
              <p className="mb-4 text-gray-900">Möchtest du die Challenge "{selectedChallenge.title}" als abgeschlossen markieren?</p>
              <div className="mb-4">
                <label className="block font-medium text-gray-900 mb-1">
                  Dein Nachweis (Text){requireProofText ? ' *' : ' (optional)'}
                </label>
                <textarea
                  className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 appearance-none"
                  placeholder="Beschreibe, wie du die Challenge gelöst hast..."
                  value={proofText}
                  onChange={e => setProofText(e.target.value)}
                  required={!!requireProofText}
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-900 mb-1">
                  Bild hochladen{requireProofImage ? ' *' : ' (optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setProofImage(e.target.files[0]);
                      setProofImageUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  required={!!requireProofImage}
                />
                {proofImageUrl && (
                  <img src={proofImageUrl} alt="Vorschau" className="mt-2 max-h-32 rounded" />
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => { setShowModal(false); setProofText(''); setProofImage(null); setProofImageUrl(''); }}>
                  Abbrechen
                </Button>
                <Button
                  onClick={() => {
                    if (
                      (requireProofText && !proofText.trim()) ||
                      (requireProofImage && !proofImage)
                    ) {
                      setShowProofAlert(true);
                      return;
                    }
                    setShowProofAlert(false);
                    markAsCompleted(selectedChallenge.id);
                  }}
                  disabled={loading}
                >
                  Abschließen
                </Button>
              </div>
              {showProofAlert && (
                <div className="mt-4 text-red-600 text-sm font-medium">
                  {requireProofText && !proofText.trim() && 'Bitte gib einen Nachweistext ein.'}
                  {requireProofText && !proofText.trim() && requireProofImage && !proofImage && ' '}
                  {requireProofImage && !proofImage && 'Bitte lade ein Bild hoch.'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
 