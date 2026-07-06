import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Basic check for auth state in localStorage
  // Note: middleware can't easily read Zustand persisted state from localStorage directly,
  // but we can check if they are trying to access protected routes without a token cookie.
  // Since we are using purely client-side JWT (Zustand + localStorage) and no cookies,
  // middleware won't have access to the token. 
  // For a purely client-side auth model, we should handle redirection in a client component or HOC.
  // However, we can enforce basic path rules here if we used cookies.
  // Instead of a strict middleware blocking without cookies, we'll let a client-side guard handle it.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
