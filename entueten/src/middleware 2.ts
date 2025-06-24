import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }
  // TODO: Check Supabase auth session (requires server-side integration)
  // For now, allow all
  return NextResponse.next();
} 