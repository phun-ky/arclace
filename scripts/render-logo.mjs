// Render the logo's PNGs from the SVG marks in docs/public/logo: the README
// banners, the social cards and the PNG icons. They're drawn as HTML in
// headless Chrome with the docs site's system fonts, so nothing is downloaded
// and the text matches the site.
// Needs google-chrome (or CHROME=/path/to/chrome) and Python with Pillow,
// which turns each PNG into a palette image to keep it small.
// Usage: npm run logo
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  LOGO,
  MONO,
  PUBLIC,
  SANS,
  THEMES,
  render,
  sized
} from './lib/render.mjs';

const TAGLINE = 'Draw SVG lines between DOM elements.';
const page = (body, { bg, dot }) => `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; overflow: hidden; font-family: ${SANS}; }
  body { background: ${bg}; }
  /* A faint dot grid, like the canvas of a node editor */
  .grid { position: absolute; inset: 0;
    background: radial-gradient(circle, ${dot} 1.5px, transparent 1.6px) 0 0 / 32px 32px; }
  .card { position: relative; display: flex; align-items: center; height: 100%; }
  .card svg { flex: none; }
  h1 { margin: 0; font-weight: 600; letter-spacing: -0.03em; line-height: 1; }
  p { margin: 0; }
</style>${body}`;
const banner = (theme) =>
  page(
    `<div style="position:relative;width:1280px;height:320px">
      <div class="grid"></div>
      <div class="card" style="padding:0 96px;gap:40px">
        ${sized(theme.mark, 144)}
        <div>
          <h1 style="font-size:84px;color:${theme.text}">Arclace</h1>
          <p style="margin-top:18px;font-size:30px;color:${theme.muted}">${TAGLINE}</p>
        </div>
      </div>
    </div>`,
    theme
  );
const social = (theme) =>
  page(
    `<div style="position:relative;width:1200px;height:630px">
      <div class="grid"></div>
      <div style="position:absolute;left:96px;top:96px">${sized(theme.mark, 176)}</div>
      <div style="position:absolute;left:96px;bottom:96px">
        <h1 style="font-size:96px;color:${theme.text}">Arclace</h1>
        <p style="margin-top:22px;font-size:36px;color:${theme.muted}">${TAGLINE}</p>
        <p style="margin-top:26px;font-family:${MONO};font-size:24px;color:${theme.muted}">phun-ky.net/arclace</p>
      </div>
    </div>`,
    theme
  );
const favicon = readFileSync(join(PUBLIC, 'favicon.svg'), 'utf8');
const icon = (size, rounded) =>
  page(
    `<div style="width:${size}px;height:${size}px">${sized(
      rounded ? favicon : favicon.replace('rx="7"', 'rx="0"'),
      size
    )}</div>`,
    { bg: 'transparent', dot: 'transparent' }
  );
const OUTPUTS = [
  {
    file: 'banner-dark.png',
    html: banner(THEMES.dark),
    width: 1280,
    height: 320,
    scale: 2
  },
  {
    file: 'banner-light.png',
    html: banner(THEMES.light),
    width: 1280,
    height: 320,
    scale: 2
  },
  {
    file: 'social.png',
    html: social(THEMES.dark),
    width: 1200,
    height: 630,
    scale: 1
  },
  {
    file: 'social@2x.png',
    html: social(THEMES.dark),
    width: 1200,
    height: 630,
    scale: 2
  },
  {
    file: 'favicon-32.png',
    html: icon(32, true),
    width: 32,
    height: 32,
    scale: 1,
    transparent: true
  },
  // iOS rounds the corners itself, so the tile is square
  {
    file: 'apple-touch-icon.png',
    html: icon(180, false),
    width: 180,
    height: 180,
    scale: 1
  }
];

await render(
  OUTPUTS.map(({ file, ...output }) => ({ path: join(LOGO, file), ...output }))
);
