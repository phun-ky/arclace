// Renders the release banners for a major release into docs/public/images,
// on the dot grid of the docs site: four formats (banner, og, square and
// portrait), each at 1x and 2x, as palette PNGs. The diagram on each banner
// is drawn by Arclace itself, from the build in dist.
//
// Usage: npm run build, then npm run banners -- <release>, e.g. 1.0
// The content is in scripts/banners/<release>.mjs. Rendering uses the docs
// site's system fonts, so nothing is downloaded; see scripts/lib/render.mjs
// for what it needs.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  MONO,
  PUBLIC,
  ROOT,
  SANS,
  THEMES,
  render,
  sized
} from '../lib/render.mjs';

const OUT = join(PUBLIC, 'images');
const FORMATS = [
  { suffix: '', width: 1200, height: 600, layout: 'wide' },
  { suffix: '-og', width: 1200, height: 630, layout: 'wide' },
  { suffix: '-square', width: 1080, height: 1080, layout: 'tall' },
  { suffix: '-portrait', width: 1080, height: 1350, layout: 'tall' }
];
const SCALES = [1, 2];
const release = process.argv[2];
const umd = join(ROOT, 'dist', 'arclace.umd.cjs');

if (!release) {
  console.error('Usage: npm run banners -- <release>, e.g. 1.0');
  process.exit(1);
}

if (!existsSync(umd)) {
  console.error('dist/arclace.umd.cjs is missing: run npm run build first');
  process.exit(1);
}

const { default: content } = await import(
  pathToFileURL(join(ROOT, 'scripts', 'banners', `${release}.mjs`)).href
);
const theme = THEMES.light;
const escape = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
// Inlined, so the page needs no file access; </script> can't appear in it
const script = readFileSync(umd, 'utf8').replaceAll('</script', '<\\/script');
const styles = readFileSync(join(ROOT, 'dist', 'style.css'), 'utf8');
const title = content.title
  .map((part) =>
    typeof part === 'string'
      ? escape(part)
      : `<span class="accent">${escape(part.accent)}</span>`
  )
  .join('<br>');
const nodes = content.nodes
  .map(
    (node) =>
      `<div class="node${node.accent ? ' accent' : ''}" id="${node.id}">
        <b>${escape(node.title)}</b><span>${escape(node.detail)}</span>
      </div>`
  )
  .join('');
const lines = JSON.stringify(
  content.lines.map(({ start, end, ...options }) => [
    `#${start}`,
    `#${end}`,
    options
  ])
);
const page = (layout, format) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
${styles}
:root { --bg: ${theme.bg}; --dot: ${theme.dot}; --border: ${theme.border};
  --node: ${theme.node}; --text: ${theme.text}; --muted: ${theme.muted};
  --brand: ${theme.brand}; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; }
body { position: relative; overflow: hidden; color: var(--text); font-family: ${SANS};
  background: var(--bg) radial-gradient(circle, var(--dot) 1.5px, transparent 1.6px) center top / 28px 28px; }
/* Text sits on the background colour, never on a dot, as on the docs site */
.pill, h1, p { position: absolute; background: var(--bg); box-shadow: 0 0 24px 20px var(--bg); }
.pill { display: inline-flex; align-items: center; gap: 14px; padding: 10px 22px 10px 12px;
  border: 1px solid var(--border); border-radius: 999px; box-shadow: none;
  font: 500 18px ${MONO}; letter-spacing: 0.02em; color: var(--muted); }
h1 { font-weight: 650; line-height: 1.04; letter-spacing: -0.035em; }
.accent { color: var(--brand); }
p { color: var(--muted); line-height: 1.5; }
.diagram { position: absolute; }
.node { position: absolute; display: flex; flex-direction: column; gap: 6px;
  padding: 18px 24px; border: 1px solid var(--border); border-radius: 14px; background: var(--node);
  box-shadow: 0 1px 2px rgb(0 0 0 / 6%), 0 10px 28px rgb(0 0 0 / 7%); }
.node b { font: 600 30px ${MONO}; color: var(--text); }
.node span { font-size: 18px; color: var(--muted); white-space: nowrap; }
/* An inset ring, not a wider border, so every node has the same size */
.node.accent { border-color: var(--brand); box-shadow: inset 0 0 0 1px var(--brand),
  0 1px 2px rgb(0 0 0 / 6%), 0 10px 28px rgb(0 0 0 / 7%); }
.node.accent b { color: var(--brand); }
.arc-connection { --arc-color: var(--brand); --arc-label-color: var(--muted);
  --arc-label-halo: var(--bg); --arc-anchor-fill: var(--bg); }
/* A wider halo than style.css, so a line never runs through its label */
.arc-label { font-family: ${SANS}; stroke-width: 12px; }
/* wide: text left, the diagram right, top to bottom */
.wide .pill { top: 64px; left: 72px; }
.wide h1 { top: 172px; left: 72px; width: 600px; font-size: 56px; }
.wide p { bottom: 72px; left: 72px; width: 540px; font-size: 21px; }
.wide .diagram { top: 64px; right: 72px; bottom: 64px; width: 440px; --arc-label-size: 18px; }
.wide #from { top: 0; left: 0; }
.wide #now { top: 50%; right: 0; transform: translateY(-50%); }
.wide .node { width: 184px; }
.wide #next { bottom: 0; right: 0; }
/* tall: text on top, the diagram below, left to right */
.tall .pill { top: 80px; left: 80px; font-size: 22px; }
.tall .pill svg { width: 36px; height: 36px; }
.tall h1 { top: 196px; left: 80px; width: 920px; font-size: 92px; }
.tall p { top: 444px; left: 80px; width: 900px; font-size: 28px; }
.tall .diagram { left: 80px; right: 80px; bottom: 88px; height: 340px; --arc-label-size: 24px; }
.tall .node { width: 300px; padding: 22px 30px; }
.tall .node b { font-size: 38px; }
.tall .node span { font-size: 22px; }
.tall #from { top: 0; left: 0; }
.tall #now { top: 0; right: 0; }
.tall #next { bottom: 0; right: 0; }
.portrait .tall .diagram { height: 520px; bottom: 136px; }
</style></head>
<body class="${format}"><main class="${layout}">
  <div class="pill">${sized(theme.mark, 30)}${escape(content.pill)}</div>
  <h1>${title}</h1>
  <p>${escape(content.body)}</p>
  <div class="diagram" id="diagram">${nodes}</div>
</main>
<script>${script}</script>
<script>
  const arclace = new Arclace.Arclace({ container: '#diagram', defaults: { strokeWidth: 3, anchors: true } });
  for (const [start, end, options] of ${lines}) arclace.connect(start, end, options);
</script>
</body></html>`;
const outputs = FORMATS.flatMap(({ suffix, width, height, layout }) =>
  SCALES.map((scale) => ({
    path: join(
      OUT,
      `arclace-${content.slug}${suffix}${scale === 2 ? '@2x' : ''}.png`
    ),
    html: page(layout, suffix.slice(1)),
    width,
    height,
    scale
  }))
);

await render(outputs);
