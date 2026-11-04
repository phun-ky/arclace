// Run every example in the README and the docs site in headless Chrome,
// against the installed package. Used by check-pack.mjs, which installs the
// packed tarball first.
//
// - ts, js and tsx blocks run as modules, with the package's exports and a
//   few fixtures (arclace, connection, a, b, c, useEffect and refs) in scope when
//   the block uses them without declaring them. Every connection they draw
//   must have a path, and `expression; // 'value'` lines are asserted.
//   `expression; // throws TypeError` lines must throw an error of that name.
// - html blocks with a <script> run as pages, with CDN URLs for the package
//   mapped to the installed files the CDN would serve.
// - Other html blocks are the markup the next blocks in the file run on. A
//   block starting with <g> shows rendered output and is skipped.
// - css blocks must parse into as many rules as they have.
// - A block marked no-run (```ts no-run) is skipped: code from an earlier
//   release, such as the before half of the upgrading guide.
//
// Needs Chrome (google-chrome, or CHROME=/path/to/chrome).
import { JsxEmit, ModuleKind, ScriptTarget, transpileModule } from 'typescript';

import { spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { extname, join, relative } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

// A cold CI runner can take over 10 seconds to start Chrome
const CHROME_START_MS = 30_000;
const CHROME_POLL_MS = 100;
const BLOCK = /^```(\w*)([^\n]*)\n([\s\S]*?)^```/gm;
// `expression; // 'value'`, with a string, number or boolean value
const ASSERTED =
  /^(\s*)(.+?);\s*\/\/\s*('[^']*'|"[^"]*"|-?\d[\d.]*|true|false)\s*$/;
// `expression; // throws TypeError`, with the name of the error
const THROWS = /^(\s*)(.+?);\s*\/\/\s*throws\s+(\w+)\s*$/;
const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.cjs': 'text/javascript',
  '.js': 'text/javascript'
};
const FIXTURE_CSS = `
  body { margin: 0; font: 14px system-ui, sans-serif; }
  #diagram, #world { position: relative; display: flex; flex-wrap: wrap; gap: 40px 120px; padding: 40px; }
  .box, .node { padding: 12px 20px; border: 1px solid; }
`;
// Free names the examples use, and how each is set up
const FIXTURES = {
  a: 'const a = document.querySelector("#a");',
  b: 'const b = document.querySelector("#b");',
  c: 'const c = document.querySelector("#c");',
  arclace: 'const arclace = new Arclace({ container: "#diagram" });',
  connection:
    'const connection = arclace.connect("#a", "#b", { id: "my-connection-id" });',
  // React's useEffect: run the effect now, keep the cleanup for later
  useEffect:
    'const useEffect = (effect) => { window.__cleanup = effect() ?? undefined; };',
  containerRef:
    'const containerRef = { current: document.querySelector("#diagram") };',
  aRef: 'const aRef = { current: document.querySelector("#a") };',
  bRef: 'const bRef = { current: document.querySelector("#b") };'
};
// Fixtures that need other fixtures or exports first
const NEEDS = { connection: ['arclace'], arclace: ['Arclace'] };
/** Names a block declares or imports. */
const declaredIn = (code) =>
  new Set([
    ...[...code.matchAll(/\b(?:const|let|var|function|class)\s+(\w+)/g)].map(
      ([, name]) => name
    ),
    ...[...code.matchAll(/\bimport\s*\{([^}]*)\}/g)].flatMap(([, names]) =>
      names.split(',').map((name) =>
        name
          .trim()
          .split(/\s+as\s+/)
          .pop()
      )
    )
  ]);
/** Turn the commented values of a block into assertions. */
const withAssertions = (code) => {
  let checks = 0;

  const lines = code.split('\n').map((line) => {
    const throws = line.match(THROWS);

    if (throws) {
      const [, indent, expression, name] = throws;

      checks += 1;

      return `${indent}__throws(${JSON.stringify(expression)}, () => { ${expression}; }, ${JSON.stringify(name)});`;
    }

    const match = line.match(ASSERTED);

    if (!match || /^\s*(const|let|var|import)\b/.test(match[2])) return line;

    const [, indent, expression, expected] = match;

    checks += 1;

    return `${indent}__check(${JSON.stringify(expression)}, ${expression}, ${expected});`;
  });

  return { code: lines.join('\n'), checks };
};
/** Every code block of a Markdown file, with its line number. */
const blocksOf = (file, root) => {
  const text = readFileSync(join(root, file), 'utf8');

  return [...text.matchAll(BLOCK)].map((match) => ({
    file,
    line: text.slice(0, match.index).split('\n').length,
    language: match[1],
    run: !/\bno-run\b/.test(match[2]),
    code: match[3]
  }));
};
/** Start Chrome and connect to its first page over the DevTools protocol. */
const launch = async (profile) => {
  const chrome = spawn(
    process.env.CHROME ?? 'google-chrome',
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      // Examples get nothing from the network, only the local server
      '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
      // GitHub's Ubuntu runners don't allow Chrome's sandbox
      ...(process.env.CI ? ['--no-sandbox'] : []),
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  // Resolves with the error or exit code once Chrome has gone
  const exited = new Promise((resolve) => {
    chrome.on('error', resolve);
    chrome.on('exit', resolve);
  });

  let ws;

  try {
    let port;

    const started = Date.now();

    while (!port && Date.now() - started < CHROME_START_MS) {
      const ended = await Promise.race([exited, wait(CHROME_POLL_MS)]);

      if (ended !== undefined)
        throw new Error(
          `Chrome didn't start (${ended.message ?? `exit ${ended}`}); set CHROME to its path`
        );

      try {
        port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split(
          '\n'
        )[0];
      } catch {
        // Chrome isn't listening yet
      }
    }

    if (!port)
      throw new Error(
        `Chrome did not open a DevTools port within ${Math.round((Date.now() - started) / 1000)} seconds`
      );

    const targets = await (
      await fetch(`http://127.0.0.1:${port}/json/list`)
    ).json();

    ws = new WebSocket(
      targets.find((target) => target.type === 'page').webSocketDebuggerUrl
    );
    await new Promise((resolve) =>
      ws.addEventListener('open', resolve, { once: true })
    );
  } catch (error) {
    chrome.kill();
    await exited;
    throw error;
  }

  let id = 0;

  const pending = new Map();
  const listeners = new Set();

  ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);

    if (pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);

      pending.delete(message.id);

      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else for (const listener of listeners) listener(message);
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  return {
    send,
    listeners,
    // Chrome must be gone before its profile can be removed
    close: async () => {
      ws.close();
      chrome.kill();
      await exited;
    }
  };
};

/**
 * Run the examples of the README and the docs site.
 * @param {object} options
 * @param {string} options.root the repository
 * @param {string} options.app a directory with the package installed
 * @param {object} options.pkg the package.json contents
 * @returns {Promise<{ problems: string[], blocks: number, checks: number }>}
 */
export const checkExamples = async ({ root, app, pkg }) => {
  const installed = join(app, 'node_modules', pkg.name);
  const resolve = createRequire(join(app, 'package.json')).resolve;
  // What a bundler would load for the bare import and the stylesheet
  const moduleUrl = `/pkg/${relative(installed, resolve(pkg.name))}`;
  const styleUrl = `/pkg/${relative(installed, resolve(`${pkg.name}/style.css`))}`;
  const exported = Object.keys(
    await import(pathToFileURL(resolve(pkg.name)).href)
  );
  // The README and every page of the docs site, API reference included
  const files = [
    'README.md',
    ...readdirSync(join(root, 'docs'), { recursive: true })
      .filter((file) => file.endsWith('.md') && !file.startsWith('.vitepress'))
      .sort()
      .map((file) => join('docs', file))
  ];
  const problems = [];
  const pages = new Map();
  const runs = new Map();
  // Blocks before any markup in their file run on the README's
  const readmeMarkup = blocksOf('README.md', root).find(
    (block) =>
      block.language === 'html' && !/<script\b|^\s*<g\b/.test(block.code)
  ).code;

  let checks = 0;

  // One run per distinct example and markup; the guide repeats the README
  for (const file of new Set(files)) {
    let markup = readmeMarkup;

    for (const block of blocksOf(file, root)) {
      const where = `${block.file}:${block.line}`;

      if (block.language === 'html' && !/<script\b/.test(block.code)) {
        if (!/^\s*<g\b/.test(block.code)) markup = block.code;

        continue;
      }

      if (
        !block.run ||
        !['ts', 'js', 'tsx', 'html', 'css'].includes(block.language)
      )
        continue;

      const key = `${block.language}\n${markup}\n${block.code}`;

      if (runs.has(key)) runs.get(key).where.push(where);
      else runs.set(key, { ...block, markup, where: [where] });
    }
  }

  for (const [index, run] of [...runs.values()].entries()) {
    const head = ['<meta charset="utf-8">', `<style>${FIXTURE_CSS}</style>`];

    let body = run.markup;

    if (run.language === 'css') {
      head.push(`<style id="example">${run.code}</style>`);
      run.rules = (run.code.match(/{/g) ?? []).length;
    } else if (run.language === 'html') {
      // The CDN files are the ones package.json points them at
      body += run.code.replace(
        new RegExp(
          `https://(unpkg\\.com|cdn\\.jsdelivr\\.net/npm)/${pkg.name.replace('/', '\\/')}(@[^/"']+)?(/[^"'\\s]*)?`,
          'g'
        ),
        (_, cdn, version, path) =>
          `/pkg/${(path ?? pkg[cdn === 'unpkg.com' ? 'unpkg' : 'jsdelivr']).replace(/^\/|^\.\//g, '')}`
      );
    } else {
      const imports = /['"]@phun-ky\/arclace\/style\.css['"]/;
      const { code: asserted, checks: count } = withAssertions(
        run.code.replace(new RegExp(`^import ${imports.source};?$`, 'm'), '')
      );
      const declared = declaredIn(asserted);
      const wanted = new Set();
      const want = (name) => {
        if (declared.has(name) || wanted.has(name)) return;

        for (const need of NEEDS[name] ?? []) want(need);
        wanted.add(name);
      };
      // A name inside a string, such as the package name, isn't a use
      const code = asserted.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""');

      for (const name of [...exported, ...Object.keys(FIXTURES)]) {
        if (new RegExp(`\\b${name}\\b`).test(code)) want(name);
      }

      const names = [...wanted];
      const missing = exported.filter((name) => names.includes(name));
      const setup = names
        .filter((name) => FIXTURES[name])
        .map((name) => FIXTURES[name])
        .join('\n');
      const { outputText } = transpileModule(
        `${missing.length ? `import { ${missing.join(', ')} } from ${JSON.stringify(pkg.name)};\n` : ''}${setup}\n${asserted}`,
        {
          compilerOptions: {
            module: ModuleKind.ESNext,
            target: ScriptTarget.ES2022,
            jsx: JsxEmit.Preserve
          }
        }
      );

      checks += count;
      // A line that must throw draws nothing
      run.connects = /\b(connect|connectAll|createConnections)\(/.test(
        run.code
          .split('\n')
          .filter((line) => !THROWS.test(line))
          .join('\n')
      );
      head.push(
        `<script type="importmap">${JSON.stringify({ imports: { [pkg.name]: moduleUrl } })}</script>`
      );

      if (imports.test(run.code))
        head.push(`<link rel="stylesheet" href="${styleUrl}">`);

      body += `
<script>
  window.__check = (source, actual, expected) => {
    if (actual !== expected) throw new Error(\`the example says \${source} is \${JSON.stringify(expected)}, but it is \${JSON.stringify(actual)}\`);
  };
  window.__throws = (source, run, name) => {
    try {
      run();
    } catch (error) {
      if (error?.name === name) return;
      throw new Error(\`the example says \${source} throws a \${name}, but it throws \${error?.name}: \${error?.message}\`);
    }
    throw new Error(\`the example says \${source} throws a \${name}, but it doesn't throw\`);
  };
</script>
<script type="module">
${outputText}
window.__ran = true;
</script>`;
    }

    pages.set(
      `/page/${index}.html`,
      `<!doctype html><html><head>${head.join('\n')}</head><body>${body}</body></html>`
    );
    run.url = `/page/${index}.html`;
  }

  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');

    // Chrome asks for one on its own; no example uses it
    if (url.pathname === '/favicon.ico') {
      response.writeHead(204).end();

      return;
    }

    let content = pages.get(url.pathname);

    if (!content && url.pathname.startsWith('/pkg/')) {
      try {
        content = readFileSync(join(installed, url.pathname.slice(5)));
      } catch {
        // Not in the package
      }
    }

    if (content === undefined) {
      response.writeHead(404).end();

      return;
    }

    response
      .writeHead(200, {
        'content-type':
          TYPES[extname(url.pathname)] ?? 'application/octet-stream'
      })
      .end(content);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = mkdtempSync(join(tmpdir(), 'arclace-chrome-'));

  let chrome;
  let errors = [];

  try {
    chrome = await launch(profile);
    chrome.listeners.add(({ method, params }) => {
      if (method === 'Runtime.exceptionThrown')
        errors.push(
          params.exceptionDetails.exception?.description?.split('\n')[0] ??
            params.exceptionDetails.text
        );

      if (method === 'Runtime.consoleAPICalled' && params.type === 'error')
        errors.push(
          `console.error: ${params.args.map((arg) => arg.value ?? arg.description).join(' ')}`
        );

      if (
        method === 'Network.responseReceived' &&
        params.response.status >= 400
      )
        errors.push(`${params.response.url} gave ${params.response.status}`);

      if (method === 'Network.loadingFailed' && !params.canceled)
        errors.push(`a request failed: ${params.errorText}`);
    });
    await chrome.send('Runtime.enable');
    await chrome.send('Network.enable');
    await chrome.send('Page.enable');

    const evaluate = async (expression) =>
      (
        await chrome.send('Runtime.evaluate', {
          expression,
          awaitPromise: true,
          returnByValue: true
        })
      ).result.value;

    for (const run of runs.values()) {
      const where = run.where.join(', ');
      const first = run.code.trim().split('\n')[0];
      const loaded = new Promise((resolve) => {
        const listener = ({ method }) => {
          if (method !== 'Page.loadEventFired') return;

          chrome.listeners.delete(listener);
          resolve();
        };

        chrome.listeners.add(listener);
      });

      errors = [];
      await chrome.send('Page.navigate', { url: origin + run.url });
      await loaded;
      // Lines are drawn on the next animation frame
      await evaluate(
        'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))'
      );

      const state = await evaluate(`(() => {
        const paths = [...document.querySelectorAll('.arc-path')];
        const cleanup = window.__cleanup;
        const result = {
          ran: window.__ran === true,
          paths: paths.length,
          drawn: paths.filter((path) => /^M -?\\d/.test(path.getAttribute('d') ?? '')).length,
          rules: document.getElementById('example')?.sheet?.cssRules.length
        };
        if (typeof cleanup === 'function') {
          cleanup();
          result.cleanedUp = document.querySelectorAll('.arc-svg').length === 0;
        }
        return result;
      })()`);
      const fail = (message) =>
        problems.push(
          `the ${run.language} example at ${where} ("${first}") ${message}`
        );

      if (errors.length) fail(`fails: ${errors.join('; ')}`);
      else if (run.language === 'css') {
        if (state.rules !== run.rules)
          fail(`has ${run.rules} rules, but ${state.rules} parse`);
      } else if (run.language !== 'html' && !state.ran) fail('does not finish');
      else if ((run.connects || run.language === 'html') && state.paths === 0)
        fail('draws no lines');
      else if (state.drawn !== state.paths)
        fail(`draws ${state.drawn} of ${state.paths} lines`);
      else if (state.cleanedUp === false)
        fail('leaves the overlay behind after the cleanup of its effect');
    }
  } finally {
    await chrome?.close();
    server.close();
    rmSync(profile, { recursive: true, force: true });
  }

  return { problems, blocks: runs.size, checks };
};
