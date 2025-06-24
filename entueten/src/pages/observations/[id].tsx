import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../lib/AuthContext';
import { signOut } from '../../lib/auth';

interface Question {
  id: string;
  text: string;
}

export default function ObservationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [question, setQuestion] = useState<Question | null>(null);
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/auth/sign-in');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!id) return;
    fetch('/data/questions.json')
      .then((res) => res.json())
      .then((list: Question[]) => setQuestion(list.find((q) => q.id === id) || null));
  }, [id]);

  if (!question) return null;

  return (
    <>
      <Navbar user={user} onSignOut={handleSignOut} />
      <main className="max-w-xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Observation Survey</h1>
        <div className="mb-4">{question.text}</div>
        {/* TODO: Add answer form */}
      </main>
    </>
  );
}
