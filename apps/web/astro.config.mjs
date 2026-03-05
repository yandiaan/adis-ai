// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import path from 'node:path';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  vite: {
    server: {
      allowedHosts: [
        'adisai.xyz',
        'www.adisai.xyz',
        'adisai.cobadomain.com',
        'www.adisai.cobadomain.com',
        '8.219.190.235',
        'localhost',
      ],
    },
    preview: {
      allowedHosts: [
        'adisai.xyz',
        'www.adisai.xyz',
        'adisai.cobadomain.com',
        'www.adisai.cobadomain.com',
        '8.219.190.235',
        'localhost',
      ],
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },

  integrations: [react()],
});
