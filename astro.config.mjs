import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.ibayfront.com',
  integrations: [
    tailwind(),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});