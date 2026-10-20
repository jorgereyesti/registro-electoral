import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/lib/types/database.types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run Supabase code on static assets or Next.js internals
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/data') ||
    pathname.startsWith('/api/geo') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return supabaseResponse;
  }

  // Refreshes the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/recuperar');

  if (!user && !isAuthPage) {
    // Redirect unauthenticated user to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // Redirect authenticated user to personas dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/personas';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
