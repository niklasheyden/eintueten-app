'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import questionsData from '@/data/questions.json';
import { supabase } from '@/lib/supabaseClient';

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  category: string;
}

interface Answer {
  questionId: number;
  answer: string;
  category: string;
}

export default function ObservationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [questions] = useState<Question[]>(questionsData as Question[]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    if (!user) return;
    const fetchAnswers = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        setError('Fehler beim Laden der Antworten.');
      } else {
        setAnswers(
          (data || []).map((item: any) => ({
            questionId: parseInt(item.question_id, 10),
            answer: item.value,
            category: item.category,
          }))
        );
        if ((data || []).length > 0) {
          setAlreadyCompleted(true);
        }
      }
      setLoading(false);
    };
    fetchAnswers();
  }, [user]);

  const currentQuestion = questions[currentQuestionIndex];

  const getAnswer = (questionId: number) => {
    return answers.find((a) => a.questionId === questionId)?.answer || '';
  };

  const setAnswer = (questionId: number, answer: string) => {
    const updated = [...answers];
    const existing = updated.find((a) => a.questionId === questionId);
    if (existing) {
      existing.answer = answer;
    } else {
      updated.push({
        questionId,
        answer,
        category: currentQuestion.category,
      });
    }
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    // Remove previous answers for this user (optional, or you can upsert)
    await supabase.from('observations').delete().eq('user_id', user.id);
    // Insert all answers
    const insertData = answers.map((a) => ({
      user_id: user.id,
      question_id: a.questionId.toString(),
      value: a.answer,
      category: a.category,
      observed_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('observations').insert(insertData);
    if (error) {
      setError('Fehler beim Speichern der Antworten.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setSubmitted(true);
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    answers.forEach((answer) => {
      stats[answer.category] = (stats[answer.category] || 0) + 1;
    });
    return stats;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diet':
        return 'bg-blue-100 text-blue-800';
      case 'shopping':
        return 'bg-purple-100 text-purple-800';
      case 'sustainability':
        return 'bg-green-100 text-green-800';
      case 'gardening':
        return 'bg-emerald-100 text-emerald-800';
      case 'preferences':
        return 'bg-orange-100 text-orange-800';
      case 'cooking':
        return 'bg-red-100 text-red-800';
      case 'challenges':
        return 'bg-yellow-100 text-yellow-800';
      case 'motivation':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add German translations for category
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'diet': return 'Ernährung';
      case 'shopping': return 'Einkaufen';
      case 'sustainability': return 'Nachhaltigkeit';
      case 'gardening': return 'Garten';
      case 'preferences': return 'Vorlieben';
      case 'cooking': return 'Kochen';
      case 'challenges': return 'Challenges';
      case 'motivation': return 'Motivation';
      default: return category;
    }
  };

  if (alreadyCompleted && !submitted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar user={user} onSignOut={handleSignOut} />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="p-8">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Umfrage bereits abgeschlossen</h1>
                <p className="text-gray-600 mb-6">
                  Du hast die Beobachtungs-Umfrage bereits ausgefüllt. Vielen Dank für deine Teilnahme!
                </p>
                <Button onClick={() => router.push('/dashboard')}>Zur Übersicht</Button>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (submitted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar user={user} onSignOut={handleSignOut} />

          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Umfrage abgeschlossen!</h1>
                <p className="text-gray-600 mb-6">
                  Vielen Dank für deine Antworten. Deine Rückmeldungen helfen uns, nachhaltige Essgewohnheiten besser zu verstehen.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{answers.length}</p>
                    <p className="text-sm text-gray-600">Beantwortete Fragen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Object.keys(getCategoryStats()).length}
                    </p>
                    <p className="text-sm text-gray-600">Abgedeckte Kategorien</p>
                  </div>
                </div>

                {error && <div className="text-red-500 mb-4">{error}</div>}
                {loading && (
                  <div className="text-center text-gray-500 mb-4">Lade...</div>
                )}

                <Button onClick={() => router.push('/dashboard')}>Zur Übersicht</Button>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onSignOut={handleSignOut} />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Beobachtungs-Umfrage</h1>
              <p className="text-gray-600">Teile deine Erfahrungen zu nachhaltigen Essgewohnheiten</p>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            {loading && (
              <div className="text-center text-gray-500 mb-4">Lade...</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Card className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Frage {currentQuestionIndex + 1} von {questions.length}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(currentQuestion.category)}`}
                      >
                        {getCategoryLabel(currentQuestion.category)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>

                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={getAnswer(currentQuestion.id) === option}
                            onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'text' && (
                    <textarea
                      value={getAnswer(currentQuestion.id)}
                      onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Teile deine Gedanken..."
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-gray-900"
                    />
                  )}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      Zurück
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={loading || answers.length < questions.length}
                      >
                        {loading ? 'Wird gesendet...' : 'Umfrage abschließen'}
                      </Button>
                    ) : (
                      <Button onClick={handleNext} disabled={!getAnswer(currentQuestion.id)}>
                        Weiter
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              <div>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fortschritt</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">Beantwortet:</span>
                      <span className="font-medium text-green-600">{answers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">Übrig:</span>
                      <span className="font-medium text-red-600">
                        {questions.length - answers.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">Fortschritt:</span>
                      <span className="font-medium text-black">
                        {Math.round((answers.length / questions.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
 