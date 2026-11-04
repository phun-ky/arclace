// Render the logo's PNGs from the SVG marks in docs/public/logo: the README
// banners, the social cards and the PNG icons. They're drawn as HTML in
// headless Chrome with the docs site's system fonts, so nothing is downloaded
// and the text matches the site.
// Needs google-chrome (or CHROME=/path/to/chrome) and Python with Pillow,
// which turns each PNG into a palette image to keep it small.
// Usage: npm run logo
import { execFileSync, spawn } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'docs', 'public');
const LOGO = join(PUBLIC, 'logo');
const work = mkdtempSync(join(tmpdir(), 'arclace-logo-'));
const svg = (file) => readFileSync(file, 'utf8');
// The same font stacks as docs/.vitepress/theme/custom.css
const SANS =
  // Font names of several words need no quotes in CSS
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace';
// The docs site's colours: background, the dot grid, text and muted text
// (--vp-c-text-2, 4.5:1 or more on the background)
const THEMES = {
  dark: {
    bg: '#1b1b1f',
    dot: '#3c3c43',
    text: '#dfdfd6',
    muted: '#98989f',
    mark: svg(join(LOGO, 'mark-dark.svg'))
  },
  light: {
    bg: '#ffffff',
    dot: '#dcdce2',
    text: '#1b1b1f',
    muted: '#67676c',
    mark: svg(join(LOGO, 'mark.svg'))
  }
};
const TAGLINE = 'Draw SVG lines between DOM elements.';
const sized = (mark, size) =>
  mark.replace('<svg ', `<svg width="${size}" height="${size}" `);
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
const favicon = svg(join(PUBLIC, 'favicon.svg'));
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
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn(process.env.CHROME ?? 'google-chrome', [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(work, 'profile')}`,
  'about:blank'
]);

try {
  let target;

  // A cold machine can take a while to start Chrome
  for (let i = 0; i < 150 && !target; i++) {
    await wait(200);

    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();

      target = list.find((entry) => entry.type === 'page');
    } catch {
      // Chrome isn't listening yet
    }
  }

  if (!target) throw new Error('Chrome did not start within 30 seconds');

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve) =>
    ws.addEventListener('open', resolve, { once: true })
  );

  let id = 0;

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mine = ++id;
      const onMessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.id !== mine) return;

        ws.removeEventListener('message', onMessage);

        if (message.error)
          reject(new Error(`${method}: ${message.error.message}`));
        else resolve(message.result);
      };

      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id: mine, method, params }));
    });

  await send('Page.enable');

  for (const output of OUTPUTS) {
    const file = join(work, `${output.file}.html`);

    writeFileSync(file, output.html);
    await send('Emulation.setDeviceMetricsOverride', {
      width: output.width,
      height: output.height,
      deviceScaleFactor: output.scale,
      mobile: false
    });
    await send('Emulation.setDefaultBackgroundColorOverride', {
      color: output.transparent ? { r: 0, g: 0, b: 0, a: 0 } : undefined
    });
    await send('Page.navigate', { url: pathToFileURL(file).href });
    await wait(800);
    await send('Runtime.evaluate', {
      expression: 'document.fonts.ready',
      awaitPromise: true
    });

    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: output.width, height: output.height, scale: 1 }
    });

    writeFileSync(join(LOGO, output.file), Buffer.from(data, 'base64'));
  }

  ws.close();
} finally {
  chrome.kill();
  rmSync(work, { recursive: true, force: true });
}

// A palette of up to 256 colours keeps flat artwork sharp and small
execFileSync(
  'python3',
  [
    '-c',
    `import sys
from PIL import Image
for path in sys.argv[1:]:
    image = Image.open(path)
    image = image.convert('RGBA') if image.mode != 'RGBA' else image
    image.quantize(256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)`,
    ...OUTPUTS.map(({ file }) => join(LOGO, file))
  ],
  { stdio: 'inherit' }
);

for (const { file } of OUTPUTS) {
  console.log(`${file}: ${statSync(join(LOGO, file)).size} bytes`);
}
