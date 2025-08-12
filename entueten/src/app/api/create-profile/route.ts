import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { userId, participantId } = await request.json();

    if (!userId || !participantId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and participantId' },
        { status: 400 }
      );
    }

    console.log('🔧 API: Creating profile for user:', userId, 'with participant ID:', participantId);

    // Use service role to create/update profile (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        username: participantId,
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      console.error('❌ API: Profile creation error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log('✅ API: Profile created successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ API: Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
