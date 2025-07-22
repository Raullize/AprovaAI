import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        const { pathname } = req.nextUrl
        
        // Protect dashboard and other authenticated routes
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Allow access to other routes
        return true
      },
    },
  }
)

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    // Add other protected routes here
  ]
}