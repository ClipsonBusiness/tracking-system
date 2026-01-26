import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  // Handle root path with ?ref= parameter - rewrite to /track route
  if (pathname === '/' && searchParams.has('ref')) {
    const url = request.nextUrl.clone()
    url.pathname = '/track'
    // Preserve all query parameters including ref
    return NextResponse.rewrite(url)
  }

  // Skip middleware for API routes, admin routes, and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/l/') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/track') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // For all other paths on custom domains, let the catch-all route handle it
  // This ensures custom domain paths like /pynhl are caught
  return NextResponse.next()
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
}

