import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = [
    '/dashboard',
    '/map',
    '/cinema',
    '/lessons',
    '/duel',
    '/progress',
    '/profile',
    '/leaderboard',
    '/guild',
    '/settings',
    '/onboarding',
];

// Routes that authenticated users should NOT see (auth pages)
const AUTH_PATHS = ['/login', '/sign-up'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Enforce HTTPS in production
    const isProd = process.env.NODE_ENV === 'production';
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttp = request.nextUrl.protocol === 'http:' || forwardedProto === 'http';

    if (isProd && isHttp && !request.headers.get('host')?.includes('localhost')) {
        const httpsUrl = request.nextUrl.clone();
        httpsUrl.protocol = 'https:';
        return NextResponse.redirect(httpsUrl, 301);
    }

    // Check for Firebase auth session cookie (set by client-side Firebase)
    // We use a simple token cookie for SSR-safe auth detection
    const sessionCookie = request.cookies.get('firebase-auth-token')?.value;

    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
    const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

    // Redirect unauthenticated users away from protected pages
    if (isProtected && !sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login/signup pages
    if (isAuthPage && sessionCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Match all paths except _next/static, _next/image, favicon, and API routes
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
};
