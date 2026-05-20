import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - _next internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};