// Shared by the logo and banner scripts: the docs site's fonts and colours,
// and a renderer that screenshots HTML pages in headless Chrome and turns
// the PNGs into palette images.
// Needs google-chrome (or CHROME=/path/to/chrome) and Python with Pillow.
import { execFileSync, spawn } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

export const PUBLIC = join(ROOT, 'docs', 'public');

export const LOGO = join(PUBLIC, 'logo');

const svg = (file) => readFileSync(file, 'utf8');

// The same font stacks as docs/.vitepress/theme/custom.css
export const SANS =
  // Font names of several words need no quotes in CSS
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';

export const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace';

// The docs site's colours: background, the dot grid, a node's border, text,
// muted text (--vp-c-text-2, 4.5:1 or more on the background) and the brand
export const THEMES = {
  dark: {
    bg: '#1b1b1f',
    dot: '#3c3c43',
    border: '#2e2e32',
    node: '#202127',
    text: '#dfdfd6',
    muted: '#98989f',
    brand: '#7aa5ff',
    mark: svg(join(LOGO, 'mark-dark.svg'))
  },
  light: {
    bg: '#ffffff',
    dot: '#dcdce2',
    border: '#e2e2e3',
    node: '#ffffff',
    text: '#1b1b1f',
    muted: '#67676c',
    brand: '#0054f0',
    mark: svg(join(LOGO, 'mark.svg'))
  }
};

/** An SVG mark with a width and height. */
export const sized = (mark, size) =>
  mark.replace('<svg ', `<svg width="${size}" height="${size}" `);

/**
 * Screenshots each page and writes it as a palette PNG.
 *
 * @param {Array<{ path: string, html: string, width: number, height: number,
 *   scale: number, transparent?: boolean }>} outputs - `path` is absolute.
 */
export const render = async (outputs) => {
  const work = mkdtempSync(join(tmpdir(), 'arclace-render-'));
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
        const list = await (
          await fetch(`http://127.0.0.1:${port}/json`)
        ).json();

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

    for (const [index, output] of outputs.entries()) {
      const file = join(work, `${index}.html`);

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
        clip: {
          x: 0,
          y: 0,
          width: output.width,
          height: output.height,
          scale: 1
        }
      });

      mkdirSync(dirname(output.path), { recursive: true });
      writeFileSync(output.path, Buffer.from(data, 'base64'));
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
      ...outputs.map(({ path }) => path)
    ],
    { stdio: 'inherit' }
  );

  for (const { path } of outputs) {
    console.log(`${relative(ROOT, path)}: ${statSync(path).size} bytes`);
  }
};
