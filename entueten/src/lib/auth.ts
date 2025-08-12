import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  // Add any custom user properties here
}

export const signUp = async (email: string, password: string, participantId?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // If signup was successful and we have a participant ID, create the profile
  if (data.user && !error && participantId) {
    console.log('🔍 Creating profile with participant ID:', participantId);
    
    // Try API route approach first (uses service role, bypasses RLS)
    try {
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.user.id,
          participantId: participantId,
        }),
      });

      const apiResult = await response.json();

      if (response.ok && apiResult.success) {
        console.log('✅ Profile created via API successfully!');
      } else {
        console.error('❌ API route failed:', apiResult.error);
        
        // Fallback to direct approach
        console.log('🔄 Trying direct database approach...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: participantId,
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('❌ Direct approach also failed:', profileError);
        } else {
          console.log('✅ Profile created via direct approach!');
        }
      }
    } catch (fetchError) {
      console.error('❌ Fetch error, trying direct approach:', fetchError);
      
      // Fallback to direct approach
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: participantId,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('❌ Direct approach also failed:', profileError);
      } else {
        console.log('✅ Profile created via direct approach!');
      }
    }
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
};
