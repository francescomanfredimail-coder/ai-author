import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Permetti l'accesso alla pagina di login senza autenticazione
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Per le altre route, il controllo viene fatto lato client tramite AuthGuard
  // Questo middleware può essere esteso in futuro per protezione server-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

