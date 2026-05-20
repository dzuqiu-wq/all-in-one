import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async () => {
  // Default to 'en' - actual locale will be determined by middleware
  return {
    messages: (await import('./messages/en')).default,
  };
});