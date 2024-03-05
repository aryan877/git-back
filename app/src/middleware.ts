import { NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up', '/'],
  ignoredRoutes: ['/api/github/callback'],
  afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    if (auth.userId && auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Allow all other requests to proceed
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
