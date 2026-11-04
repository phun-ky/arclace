<script setup lang="ts">
import {
  Arclace,
  type ArcConnectionOptionsType,
  type ArcPathType,
  type ArcArrowType
} from '@phun-ky/arclace';
import '@phun-ky/arclace/style.css';
import { onMounted, onUnmounted, ref, watch } from 'vue';

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
  ['theme', 'docs', 'examples', { startSide: 'bottom', stopSide: 'top' }]
];

const type = ref<ArcPathType>('bezier');
const arrow = ref<ArcArrowType>('end');
const labels = ref(true);
const anchors = ref(false);
const animated = ref(false);
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

const apply = (): void => {
  arclace?.connections.forEach((connection, i) =>
    connection.setOptions({
      type: type.value,
      arrow: arrow.value,
      anchors: anchors.value,
      animated: animated.value,
      label: labels.value ? edges[i][2] : undefined,
      dashed: edges[i][3]?.dashed
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
    edges.map(([start, stop, label, options]) => ({
      startElement: `#arc-${start}`,
      stopElement: `#arc-${stop}`,
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

watch([type, arrow, labels, anchors, animated], apply);
</script>

<template>
  <div class="playground">
    <div class="controls">
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
      <label><input v-model="labels" type="checkbox" /> Labels</label>
      <label><input v-model="anchors" type="checkbox" /> Anchors</label>
      <label><input v-model="animated" type="checkbox" /> Animated</label>
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
    </div>
    <div
      ref="canvas"
      class="canvas"
      :style="{ height: `${WORLD_HEIGHT * Math.max(fitted, 0.5)}px` }"
    >
      <!-- Zooming scales the container; lines are measured in its local space -->
      <div
        ref="world"
        class="world"
        :style="{ transform: `scale(${zoom})` }"
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
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
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
  background-color: var(--vp-c-bg-soft);
  background-image: radial-gradient(var(--vp-c-divider) 1px, transparent 0);
  background-size: 20px 20px;
}

.world {
  position: absolute;
  inset: 0;
  width: 900px;
  transform-origin: 0 0;
  --arc-color: var(--vp-c-text-2);
  --arc-label-color: var(--vp-c-text-1);
  --arc-label-halo: var(--vp-c-bg-soft);
  --arc-anchor-fill: var(--vp-c-bg-soft);
}

.node {
  position: absolute;
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--vp-c-bg);
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
  color: #dbe6ff;
}

.world :deep(.arc-connection.highlight) {
  --arc-color: var(--vp-c-brand-1);
}
</style>
