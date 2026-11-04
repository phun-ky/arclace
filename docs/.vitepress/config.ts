import { defineConfig } from 'vitepress';

import { fileURLToPath } from 'node:url';

import pkg from '../../package.json' with { type: 'json' };
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

const SITE = 'https://phun-ky.net/connect-the-things/';
const DESCRIPTION = 'Draw SVG lines between DOM elements.';
const source = (path: string): string =>
  fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  base: '/connect-the-things/',
  lang: 'en-GB',
  title: 'connect-the-things',
  description: DESCRIPTION,
  head: [
    // head links aren't prefixed with base, so they carry /connect-the-things/
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/connect-the-things/favicon.svg'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: SITE }],
    ['meta', { property: 'og:title', content: 'connect-the-things' }],
    ['meta', { property: 'og:description', content: DESCRIPTION }],
    ['meta', { property: 'og:locale', content: 'en_GB' }]
  ],
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: SITE },
  themeConfig: {
    logo: { src: '/favicon.svg', alt: '' },
    search: { provider: 'local' },
    editLink: {
      pattern:
        'https://github.com/phun-ky/connect-the-things/edit/main/docs/:path',
      text: 'Suggest changes to this page'
    },
    nav: [
      { text: 'Guide', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Examples', link: '/examples' },
      { text: 'API', link: '/api/', activeMatch: '/api/' },
      {
        text: pkg.version,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/phun-ky/connect-the-things/blob/main/CHANGELOG.md'
          },
          {
            text: 'Contributing',
            link: 'https://github.com/phun-ky/connect-the-things/blob/main/CONTRIBUTING.md'
          }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting started', link: '/guide/' },
            { text: 'How it works', link: '/guide/how-it-works' },
            { text: 'Options', link: '/guide/options' },
            { text: 'Styling', link: '/guide/styling' },
            { text: 'Background', link: '/guide/background' }
          ]
        }
      ],
      '/api/': [{ text: 'API', items: typedocSidebar }]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/phun-ky/connect-the-things' },
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/@phun-ky/connect-the-things'
      }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-present Alexander Vassbotn Røyne-Helgesen'
    }
  },
  vite: {
    resolve: {
      // Examples import the package by name and run the source
      alias: [
        {
          find: /^@phun-ky\/connect-the-things\/style\.css$/,
          replacement: source('style.css')
        },
        {
          find: /^@phun-ky\/connect-the-things$/,
          replacement: source('index.ts')
        }
      ]
    }
  }
});
