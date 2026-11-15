import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('siapasn_token')?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profil') ||
    pathname.startsWith('/riwayat') ||
    pathname.startsWith('/favorit') ||
    pathname.includes('/exam') ||
    pathname.startsWith('/admin');

  // 1. If user already has an active session and accesses /login or /register, redirect to /dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. If guest user tries to access protected routes, redirect smoothly to /login with original return url
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profil/:path*',
    '/riwayat/:path*',
    '/favorit/:path*',
    '/tryout/:packageId/exam',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
