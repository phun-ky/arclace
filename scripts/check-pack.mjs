// Check what npm would publish: pack the package, check the tarball holds the
// files package.json points at, its LICENSE, README and CHANGELOG, and no
// tests, lint it with publint and @arethetypeswrong/cli, then install it in an
// empty project, check every source map resolves, and call the package through
// import, require, the dist path, the UMD build and a browser bundle. It also
// checks that the ES module build bundles no dependencies. Last, it runs every
// example in the README and the docs site in headless Chrome against the
// installed package (see check-examples.mjs).
// Run after `npm run build`.
//
// With CHECK_PACK_NODE set to another Node binary, the smoke tests also run on
// it, and its version must be the engines minimum, so the oldest Node the
// package allows is tested.
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { checkExamples } from './check-examples.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BIN = join(ROOT, 'node_modules', '.bin');
const FLOOR_NODE = process.env.CHECK_PACK_NODE;
/** Run a linter; return its output if it fails. */
const lint = (command, args) => {
  try {
    execFileSync(join(BIN, command), args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    return undefined;
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`.trim();
  }
};
// A bare package name after from, import( or require(
const IMPORT =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"'.][^"']*)["']/g;
/** Every .map file under dir. */
const mapsIn = (dir) =>
  readdirSync(dir, { recursive: true })
    .filter((file) => file.endsWith('.map'))
    .map((file) => join(dir, file));
const npm = (args, cwd) =>
  execFileSync('npm', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });
/** Every file path a package.json points at, without the leading ./ */
const entryPoints = (pkg) => {
  const paths = [];
  const collect = (value) => {
    if (typeof value === 'string') paths.push(value);
    else if (value && typeof value === 'object')
      Object.values(value).forEach(collect);
  };

  collect(pkg.exports);
  collect(pkg.main);
  collect(pkg.module);
  collect(pkg.types);
  collect(pkg.unpkg);
  collect(pkg.jsdelivr);

  // Subpath patterns such as ./dist/* are not files
  return paths
    .filter((path) => !path.includes('*'))
    .map((path) => path.replace(/^\.\//, ''));
};
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'arclace-pack-'));
const problems = [];

try {
  const output = JSON.parse(
    npm(['pack', '--json', '--pack-destination', work], ROOT)
  );
  // An array in npm 11, an object keyed by package name in npm 12
  const packed = Array.isArray(output) ? output[0] : Object.values(output)[0];
  const files = new Set(packed.files.map((file) => file.path));

  // npm adds LICENSE and README.md on its own, if the package has them
  for (const path of [
    ...entryPoints(pkg),
    'LICENSE',
    'README.md',
    'CHANGELOG.md'
  ]) {
    if (!files.has(path)) problems.push(`${path} is not in the tarball`);
  }

  for (const path of files) {
    if (/(^|\/)__tests__\/|\.tsbuildinfo$/.test(path)) {
      problems.push(`${path} should not be published`);
    }
  }

  const tarball = join(work, packed.filename);
  // ES modules only: require() works through require(esm) on Node 22.12+.
  // The stylesheet has no types to check.
  // (--exclude-entrypoints takes a list, so the tarball goes first)
  const types = lint('attw', [
    tarball,
    '--profile',
    'esm-only',
    '--exclude-entrypoints',
    './style.css'
  ]);
  const publint = lint('publint', ['--strict', tarball]);

  if (types) problems.push(`@arethetypeswrong/cli:\n${types}`);

  if (publint) problems.push(`publint:\n${publint}`);

  console.log(
    `${pkg.name}@${pkg.version}: ${files.size} files, ${packed.size} bytes`
  );

  if (problems.length === 0) {
    const app = join(work, 'app');
    const installed = join(app, 'node_modules', pkg.name);

    mkdirSync(app);
    writeFileSync(
      join(app, 'package.json'),
      '{ "name": "app", "private": true }\n'
    );
    npm(
      [
        'install',
        '--no-audit',
        '--no-fund',
        '--ignore-scripts',
        // The dependencies come from the registry, preferably the cache
        '--prefer-offline',
        tarball
      ],
      app
    );

    // Runtime dependencies are declared, never bundled: the ES module build
    // may not contain code from node_modules, and every package it imports
    // must be a dependency. Only the UMD build (unpkg), for script tags, may
    // inline them.
    const declared = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {})
    ]);
    const importsOf = new Map();
    const moduleBuilds = new Set(
      [pkg.exports?.['.']?.default, pkg.main, pkg.module]
        .filter(Boolean)
        .map((path) => path.replace(/^\.\//, ''))
    );

    for (const file of moduleBuilds) {
      const code = readFileSync(join(installed, file), 'utf8');
      const map = `${join(installed, file)}.map`;
      const inlined = existsSync(map)
        ? JSON.parse(readFileSync(map, 'utf8')).sources.filter((source) =>
            source.includes('node_modules/')
          )
        : [];
      const imported = [...code.matchAll(IMPORT)]
        .map(([, specifier]) => specifier)
        .filter((specifier) => !specifier.startsWith('node:'))
        .map((specifier) =>
          specifier
            .split('/')
            .slice(0, specifier.startsWith('@') ? 2 : 1)
            .join('/')
        );

      for (const source of inlined) {
        problems.push(
          `${file} inlines ${source}; declare it in dependencies and keep it external`
        );
      }

      for (const name of new Set(imported)) {
        if (!declared.has(name))
          problems.push(`${file} imports ${name}, which isn't in dependencies`);
      }

      importsOf.set(file, new Set(imported));
    }

    // A browser can't resolve the bare imports of the ES module build, so the
    // README must not load that file from a CDN as is (?module, /+esm or an
    // import map resolve them)
    const esmBuild = (pkg.exports?.['.']?.default ?? pkg.module)?.replace(
      /^\.\//,
      ''
    );

    if (esmBuild && importsOf.get(esmBuild)?.size) {
      const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
      const raw = new RegExp(
        `https://[^\\s'"]+/${esmBuild.replaceAll('.', '\\.')}(?!\\?module)['"\\s]`,
        'g'
      );

      for (const [url] of readme.matchAll(raw)) {
        problems.push(
          `README.md loads ${url.slice(0, -1)} in a browser, but ${esmBuild} imports ${[...importsOf.get(esmBuild)].join(', ')}, which a browser can't resolve`
        );
      }
    }

    // Our own sources must be published next to the maps; bundled
    // dependencies are not installed, so their source must be embedded
    for (const map of mapsIn(installed)) {
      const { sources, sourcesContent = [] } = JSON.parse(
        readFileSync(map, 'utf8')
      );

      sources.forEach((source, index) => {
        const resolves = source.includes('node_modules/')
          ? typeof sourcesContent[index] === 'string'
          : existsSync(join(dirname(map), source));

        if (!resolves) {
          problems.push(
            `${relative(installed, map)} points at ${source}, which isn't published`
          );
        }
      });
    }

    // Node has no DOM, so call the pure path builders, and check the class
    // exists and refuses to run without a document
    const expect = `
      const check = (how, api) => {
        if (typeof api?.Arclace !== 'function') throw new Error(how + ': Arclace is ' + typeof api?.Arclace);
        const { d } = api.straightPath({ x: 0, y: 0 }, { x: 100, y: 50 });
        if (d !== 'M 0 0 L 100 50') throw new Error(how + ': straightPath gave ' + d);
        let message;
        try { new api.Arclace(); } catch (error) { message = error.message; }
        if (!/a DOM is required/.test(message)) throw new Error(how + ': new Arclace() without a DOM gave ' + message);
        console.log(how + ': straightPath = ' + d);
      };
    `;
    const name = JSON.stringify(pkg.name);
    const umd = JSON.stringify(join(installed, pkg.unpkg ?? ''));
    const smokes = {
      'ES module import': [
        '--input-type=module',
        '-e',
        `${expect} check('import', await import(${name}));`
      ],
      // require(esm), Node 22.12 and later
      'CommonJS require': [
        '--input-type=commonjs',
        '-e',
        `${expect} check('require', require(${name}));`
      ],
      // Deep imports into dist must keep working
      'dist path import': [
        '--input-type=module',
        '-e',
        `${expect} check('dist path', await import(${JSON.stringify(`${pkg.name}/dist/arclace.js`)}));`
      ],
      // A <script> tag: no module system, the UMD build sets a global
      'UMD script global': [
        '--input-type=commonjs',
        '-e',
        `${expect} const vm = require('node:vm'); const sandbox = {}; vm.runInNewContext(require('node:fs').readFileSync(${umd}, 'utf8'), sandbox); check('UMD global', sandbox.Arclace);`
      ],
      // An AMD or CommonJS loader running the UMD build
      'UMD under CommonJS': [
        '--input-type=commonjs',
        '-e',
        `${expect} const vm = require('node:vm'); const module = { exports: {} }; vm.runInNewContext(require('node:fs').readFileSync(${umd}, 'utf8'), { module, exports: module.exports }); check('UMD CommonJS', module.exports);`
      ]
    };

    if (!pkg.unpkg) {
      problems.push('package.json has no "unpkg" field for the UMD build');
      delete smokes['UMD script global'];
      delete smokes['UMD under CommonJS'];
    }

    const runtimes = [process.execPath];

    if (FLOOR_NODE) {
      // The floor run is only meaningful on exactly the engines minimum
      const floor = pkg.engines?.node?.match(/^>=\s*(\d+\.\d+\.\d+)$/)?.[1];
      const version = execFileSync(FLOOR_NODE, ['--version'], {
        encoding: 'utf8'
      }).trim();

      if (version === `v${floor}`) runtimes.push(FLOOR_NODE);
      else
        problems.push(
          `CHECK_PACK_NODE is Node ${version}, but engines.node is ${pkg.engines?.node}`
        );
    }

    for (const runtime of runtimes) {
      const version = execFileSync(runtime, ['--version'], {
        encoding: 'utf8'
      }).trim();

      console.log(`Node ${version}:`);

      for (const [how, args] of Object.entries(smokes)) {
        try {
          execFileSync(runtime, args, { cwd: app, stdio: 'inherit' });
        } catch {
          problems.push(
            `${how} of the installed tarball failed on Node ${version}`
          );
        }
      }
    }

    // A browser bundler resolving the package from the app
    try {
      const entry = join(app, 'entry.js');

      writeFileSync(
        entry,
        `import { straightPath } from ${name};\nglobalThis.result = straightPath({ x: 0, y: 0 }, { x: 100, y: 50 }).d;\n`
      );

      const bundle = await rollup({
        input: entry,
        plugins: [nodeResolve({ browser: true, rootDir: app })]
      });
      const { output } = await bundle.generate({ format: 'iife' });
      const sandbox = {};

      await bundle.close();
      runInNewContext(output[0].code, sandbox);

      if (sandbox.result !== 'M 0 0 L 100 50')
        throw new Error(`straightPath gave ${sandbox.result}`);

      console.log(`browser bundle: straightPath = ${sandbox.result}`);
    } catch (error) {
      problems.push(
        `a browser bundle of the installed tarball failed: ${error}`
      );
    }

    try {
      const examples = await checkExamples({ root: ROOT, app, pkg });

      problems.push(...examples.problems);
      console.log(
        `examples: ${examples.blocks} run in Chrome, ${examples.checks} commented values checked`
      );
    } catch (error) {
      problems.push(`the examples could not run: ${error.message}`);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (problems.length > 0) {
  console.error('\nThe package would not publish correctly:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    '\nCheck "files" in package.json, and run npm run build first.'
  );
  process.exit(1);
}

console.log(`\n${pkg.name} packs, installs, and works from every entry point.`);
