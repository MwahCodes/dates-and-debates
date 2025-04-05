import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY; // This is your anon key

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY');
}

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Auth condition
    if (!session) {
      // Redirect to login page if trying to access protected routes
      if (req.nextUrl.pathname.startsWith('/profile') || 
          req.nextUrl.pathname.startsWith('/home')) {
        const redirectUrl = new URL('/login', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Redirect to home if trying to access auth pages while logged in
      if (req.nextUrl.pathname === '/login' || 
          req.nextUrl.pathname === '/') {
        const redirectUrl = new URL('/home', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to proceed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 