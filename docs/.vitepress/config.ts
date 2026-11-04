import { defineConfig } from 'vitepress';

import { fileURLToPath } from 'node:url';

import pkg from '../../package.json' with { type: 'json' };
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

// The code themes of phun-ky's other docs sites, with light comments darkened
// to meet 4.5:1 on the code background
import darkTheme from './shiki/accessible-aa-dark-shiki.json' with { type: 'json' };
import lightTheme from './shiki/accessible-aa-light-shiki.json' with { type: 'json' };

const SITE = 'https://phun-ky.net/arclace/';
const DESCRIPTION = 'Draw SVG lines between DOM elements.';
const source = (path: string): string =>
  fileURLToPath(new URL(`../../src/${path}`, import.meta.url));

export default defineConfig({
  base: '/arclace/',
  lang: 'en-GB',
  title: 'Arclace',
  description: DESCRIPTION,
  head: [
    // head links aren't prefixed with base, so they carry /arclace/
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/arclace/favicon.svg'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: SITE }],
    ['meta', { property: 'og:title', content: 'Arclace' }],
    ['meta', { property: 'og:description', content: DESCRIPTION }],
    ['meta', { property: 'og:locale', content: 'en_GB' }]
  ],
  markdown: {
    theme: { light: lightTheme, dark: darkTheme }
  },
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: SITE },
  themeConfig: {
    logo: { src: '/favicon.svg', alt: '' },
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/phun-ky/arclace/edit/main/docs/:path',
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
            link: 'https://github.com/phun-ky/arclace/blob/main/CHANGELOG.md'
          },
          {
            text: 'Contributing',
            link: 'https://github.com/phun-ky/arclace/blob/main/CONTRIBUTING.md'
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
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Background', link: '/guide/background' },
            { text: 'Why Arclace?', link: '/guide/why-arclace' }
          ]
        }
      ],
      '/api/': [{ text: 'API', items: typedocSidebar }]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/phun-ky/arclace' },
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/@phun-ky/arclace'
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
          find: /^@phun-ky\/arclace\/style\.css$/,
          replacement: source('style.css')
        },
        {
          find: /^@phun-ky\/arclace$/,
          replacement: source('index.ts')
        }
      ]
    }
  }
});
