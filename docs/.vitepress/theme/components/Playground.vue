<script setup lang="ts">
import {
  Arclace,
  DEFAULT_CONNECTION_OPTIONS,
  type ArcConnectionOptionsType,
  type ArcPathType,
  type ArcArrowType
} from '@phun-ky/arclace';
import '@phun-ky/arclace/style.css';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// The world is laid out at this size, and zoomed out to fit narrower pages
const WORLD_WIDTH = 900;
const WORLD_HEIGHT = 520;
const nodes = [
  {
    id: 'tokens',
    name: 'Base tokens',
    note: '$color-base-blue-100',
    left: 20,
    top: 60
  },
  {
    id: 'fonts',
    name: 'Font tokens',
    note: '$font-family-sans',
    left: 20,
    top: 260
  },
  { id: 'theme', name: 'Theme', note: '$color-cta', left: 330, top: 150 },
  {
    id: 'button',
    name: 'Button',
    note: 'primary',
    left: 680,
    top: 40,
    accent: true
  },
  { id: 'card', name: 'Card', note: 'elevated', left: 680, top: 250 },
  {
    id: 'docs',
    name: 'Docs',
    note: 'not rendered in prod',
    left: 500,
    top: 400
  }
];
const edges: [string, string, string, ArcConnectionOptionsType?][] = [
  ['tokens', 'theme', 'accent'],
  ['fonts', 'theme', 'font'],
  ['theme', 'button', 'background', { className: 'highlight' }],
  ['theme', 'card', 'surface'],
  ['fonts', 'card', 'font', { dashed: true }],
  ['theme', 'docs', 'examples', { startSide: 'bottom', endSide: 'top' }]
];

// Colors that read in both color schemes
const COLORS = {
  theme: '',
  brand: 'var(--vp-c-brand-1)',
  green: 'var(--vp-c-success-1)',
  orange: 'var(--vp-c-warning-1)',
  red: 'var(--vp-c-danger-1)'
};
const GRADIENT = ['#3b82f6', '#ec4899'];

// Options
const type = ref<ArcPathType>('bezier');
const arrow = ref<ArcArrowType>('end');
const strokeWidth = ref(2);
const curvature = ref(1);
const radius = ref(8);
const offset = ref(20);
const gap = ref(0);
const glow = ref(0);
const labels = ref(true);
const anchors = ref(false);
const dashed = ref(false);
const animated = ref(false);
const gradient = ref(false);
const spread = ref(true);
const cssStrokeWidth = ref(false);
// Styling, set as CSS on the container
const color = ref<keyof typeof COLORS>('theme');
const cssWidth = ref(0);
const labelSize = ref(12);
const zoom = ref(1);
// The zoom that fits the page; the canvas shrinks with it, down to half height
const fitted = ref(1);
const canvas = ref<HTMLElement>();
const world = ref<HTMLElement>();

let arclace: Arclace | undefined;
let resizeObserver: ResizeObserver | undefined;

const fit = (): void => {
  if (!canvas.value) return;

  fitted.value = Math.min(1, canvas.value.clientWidth / WORLD_WIDTH);
  zoom.value = fitted.value;
};

// The options every connection shares
const options = computed<ArcConnectionOptionsType>(() => ({
  type: type.value,
  arrow: arrow.value,
  strokeWidth: strokeWidth.value,
  curvature: curvature.value,
  radius: radius.value,
  offset: offset.value,
  gap: gap.value,
  glow: glow.value || false,
  anchors: anchors.value,
  dashed: dashed.value,
  animated: animated.value,
  gradient: gradient.value ? GRADIENT : undefined,
  spread: spread.value,
  cssStrokeWidth: cssStrokeWidth.value
}));

const styles = computed(() => ({
  '--arc-color': COLORS[color.value] || undefined,
  '--arc-label-size': `${labelSize.value}px`,
  '--demo-stroke': `${cssWidth.value}px`
}));

// What the controls amount to, as code to copy
const code = computed(() => {
  const defaults = Object.fromEntries(
    Object.entries(options.value).filter(
      ([key, value]) =>
        value !== undefined &&
        value !== DEFAULT_CONNECTION_OPTIONS[key as keyof typeof options.value]
    )
  );
  const vars = [
    color.value !== 'theme' && `  --arc-color: ${COLORS[color.value]};`,
    labelSize.value !== 12 && `  --arc-label-size: ${labelSize.value}px;`
  ].filter(Boolean);
  const rules = [
    vars.length && `.world {\n${vars.join('\n')}\n}`,
    cssWidth.value && `.arc-path {\n  stroke-width: ${cssWidth.value}px;\n}`
  ].filter(Boolean);
  const js = `const defaults = ${JSON.stringify(defaults, null, 2)};\n\nnew Arclace({ container: world, defaults });`;

  return rules.length ? `${js}\n\n/* CSS */\n${rules.join('\n\n')}` : js;
});

const apply = (): void => {
  arclace?.connections.forEach((connection, i) =>
    connection.setOptions({
      ...options.value,
      label: labels.value ? edges[i][2] : undefined,
      dashed: dashed.value || edges[i][3]?.dashed
    })
  );
};

// Dragging only moves the nodes. autoUpdate sees the style changes and
// redraws the lines on the next frame.
const drag = (event: PointerEvent): void => {
  const node = (event.target as HTMLElement).closest<HTMLElement>('.node');

  if (!node) return;

  const scale = zoom.value;
  const startX = event.clientX;
  const startY = event.clientY;
  const left = node.offsetLeft;
  const top = node.offsetTop;

  node.setPointerCapture(event.pointerId);
  node.classList.add('dragging');

  const move = (moveEvent: PointerEvent): void => {
    node.style.left = `${left + (moveEvent.clientX - startX) / scale}px`;
    node.style.top = `${top + (moveEvent.clientY - startY) / scale}px`;
  };
  const stop = (): void => {
    node.classList.remove('dragging');
    node.removeEventListener('pointermove', move);
    node.removeEventListener('pointerup', stop);
    node.removeEventListener('pointercancel', stop);
  };

  node.addEventListener('pointermove', move);
  node.addEventListener('pointerup', stop);
  node.addEventListener('pointercancel', stop);
};

onMounted(() => {
  fit();
  arclace = new Arclace({ container: world.value });
  arclace.connectAll(
    edges.map(([start, end, label, options]) => ({
      startElement: `#arc-${start}`,
      endElement: `#arc-${end}`,
      ...options,
      label
    }))
  );
  apply();
  resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(canvas.value!);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  arclace?.destroy();
});

// After the DOM update, so label backgrounds are measured at the new size
watch([options, labels, labelSize, cssWidth], apply, { flush: 'post' });
</script>

<template>
  <div class="playground">
    <fieldset class="controls">
      <legend>Options</legend>
      <label>
        Type
        <select v-model="type">
          <option value="bezier">bezier</option>
          <option value="orthogonal">orthogonal</option>
          <option value="straight">straight</option>
        </select>
      </label>
      <label>
        Arrow
        <select v-model="arrow">
          <option value="end">end</option>
          <option value="none">none</option>
          <option value="start">start</option>
          <option value="both">both</option>
        </select>
      </label>
      <label>
        Width
        <input
          v-model.number="strokeWidth"
          type="range"
          min="0"
          max="8"
          step="0.5"
        />
        <output>{{ strokeWidth }}</output>
      </label>
      <label v-if="type === 'bezier'">
        Curvature
        <input
          v-model.number="curvature"
          type="range"
          min="-1"
          max="3"
          step="0.1"
        />
        <output>{{ curvature }}</output>
      </label>
      <template v-if="type === 'orthogonal'">
        <label>
          Radius
          <input v-model.number="radius" type="range" min="0" max="30" />
          <output>{{ radius }}</output>
        </label>
        <label>
          Offset
          <input v-model.number="offset" type="range" min="0" max="60" />
          <output>{{ offset }}</output>
        </label>
      </template>
      <label>
        Gap
        <input v-model.number="gap" type="range" min="0" max="20" />
        <output>{{ gap }}</output>
      </label>
      <label>
        Glow
        <input v-model.number="glow" type="range" min="0" max="12" />
        <output>{{ glow || 'off' }}</output>
      </label>
      <label><input v-model="labels" type="checkbox" /> Labels</label>
      <label><input v-model="anchors" type="checkbox" /> Anchors</label>
      <label><input v-model="dashed" type="checkbox" /> Dashed</label>
      <label><input v-model="animated" type="checkbox" /> Animated</label>
      <label><input v-model="gradient" type="checkbox" /> Gradient</label>
      <label><input v-model="spread" type="checkbox" /> Spread</label>
    </fieldset>
    <fieldset class="controls">
      <legend>Styling</legend>
      <label>
        Color
        <select v-model="color">
          <option v-for="(_, name) in COLORS" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </label>
      <label>
        CSS stroke-width
        <input v-model.number="cssWidth" type="range" min="0" max="10" />
        <output>{{ cssWidth ? `${cssWidth}px` : 'unset' }}</output>
      </label>
      <label>
        <input v-model="cssStrokeWidth" type="checkbox" /> Arrows follow CSS
        width
      </label>
      <label>
        Label size
        <input v-model.number="labelSize" type="range" min="10" max="18" />
        <output>{{ labelSize }}px</output>
      </label>
      <label>
        Zoom
        <input
          v-model.number="zoom"
          type="range"
          min="0.3"
          max="1.5"
          step="0.05"
        />
      </label>
    </fieldset>
    <div
      ref="canvas"
      class="canvas arc-canvas"
      :style="{ height: `${WORLD_HEIGHT * Math.max(fitted, 0.5)}px` }"
    >
      <!-- Zooming scales the container around the canvas centre; lines are
           measured in its local space -->
      <div
        ref="world"
        class="world"
        :class="{ 'css-stroke': cssWidth > 0 }"
        :style="{
          ...styles,
          width: `${WORLD_WIDTH}px`,
          height: `${WORLD_HEIGHT}px`,
          transform: `translate(-50%, -50%) scale(${zoom})`
        }"
        @pointerdown="drag"
      >
        <div
          v-for="node in nodes"
          :id="`arc-${node.id}`"
          :key="node.id"
          class="node"
          :class="{ accent: node.accent }"
          :style="{ left: `${node.left}px`, top: `${node.top}px` }"
        >
          {{ node.name }}<small>{{ node.note }}</small>
        </div>
      </div>
    </div>
    <details class="code">
      <summary>Code for these settings</summary>
      <pre><code>{{ code }}</code></pre>
    </details>
  </div>
</template>

<style scoped>
.playground {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 0;
  padding: 12px 16px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
}

.controls legend {
  float: left;
  width: 100%;
  font-weight: 600;
}

.controls output {
  min-width: 2.5em;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
}

.controls input[type='range'] {
  width: 96px;
}

.code {
  border-top: 1px solid var(--vp-c-divider);
  font-size: 14px;
}

.code summary {
  padding: 12px 16px;
  cursor: pointer;
}

.code pre {
  margin: 0;
  padding: 0 16px 16px;
  overflow-x: auto;
  font-size: 13px;
}

.controls label {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.controls select {
  padding: 0 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
}

.canvas {
  position: relative;
  overflow: hidden;
}

.world {
  /* Centred in the canvas, and scaled around its own centre */
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 50% 50%;
  --arc-color: var(--vp-c-text-2);
  --arc-label-color: var(--vp-c-text-1);
  --arc-label-bg: var(--arc-canvas-bg);
  --arc-label-border: var(--vp-c-divider);
  --arc-label-radius: 10px;
  --arc-anchor-fill: var(--arc-canvas-bg);
}

.node {
  position: absolute;
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--arc-node-bg);
  color: var(--vp-c-text-1);
  box-shadow: var(--vp-shadow-2);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.node small {
  display: block;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

.node.dragging {
  cursor: grabbing;
  box-shadow: var(--vp-shadow-4);
}

.node.accent {
  background: var(--vp-c-brand-3);
  color: #fff;
}

.node.accent small {
  /* 4.5:1 or more on the brand blue in both color schemes */
  color: #f2f6ff;
}

.world.css-stroke :deep(.arc-path) {
  stroke-width: var(--demo-stroke);
}

.world :deep(.arc-connection.highlight) {
  --arc-color: var(--vp-c-brand-1);
}
</style>
