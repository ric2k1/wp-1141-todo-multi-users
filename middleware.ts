import { NextRequest, NextResponse } from "next/server"

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Allow access to API auth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  
  // Check for NextAuth session cookie
  // NextAuth v5 uses __Secure-authjs.session-token or authjs.session-token
  const sessionToken = req.cookies.get('__Secure-authjs.session-token') || 
                       req.cookies.get('authjs.session-token') ||
                       req.cookies.get('__Host-authjs.session-token')
  
  const isLoggedIn = !!sessionToken
  
  // If user is not authenticated and trying to access protected routes
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
