import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  site: 'https://gearversustech.com',
  integrations: [sitemap()],
  vite: {
    ssr: { noExternal: ['gsap'] },
  },
});
