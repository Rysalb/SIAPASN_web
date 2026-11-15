import { NextResponse, type NextRequest } from 'next/server';

function decodeJwtPayload(token: string): { role?: string; id?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('siapasn_token')?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profil') ||
    pathname.startsWith('/riwayat') ||
    pathname.startsWith('/favorit') ||
    pathname.includes('/exam') ||
    isAdminRoute;

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

  // 3. Strict RBAC: If a logged-in user with non-admin role tries to access /admin, immediately redirect to /dashboard
  if (token && isAdminRoute) {
    const payload = decodeJwtPayload(token);
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
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
