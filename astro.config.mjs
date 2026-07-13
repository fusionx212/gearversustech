import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'static',
  adapter: netlify(),
  site: 'https://gearversustech.com',
  vite: {
    ssr: {
      noExternal: ['three', 'gsap'],
    },
  },
});
