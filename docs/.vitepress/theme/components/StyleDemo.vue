<script setup lang="ts">
import { Arclace, type ArcConnectionOptionsType } from '@phun-ky/arclace';
import '@phun-ky/arclace/style.css';
import { onMounted, onUnmounted, ref } from 'vue';

// One connection between two boxes, and an optional second one to a third
// box, styled by the `demo-<variant>` rules below. Each variant matches a CSS block on the styling page, with the
// site's colour tokens in place of hex so it reads in both colour schemes.
const props = defineProps<{
  variant: string;
  options?: ArcConnectionOptionsType;
  second?: ArcConnectionOptionsType;
}>();

const world = ref<HTMLElement>();
const start = ref<HTMLElement>();
const end = ref<HTMLElement>();
const other = ref<HTMLElement>();

let arclace: Arclace | undefined;

onMounted(() => {
  arclace = new Arclace({ container: world.value });
  arclace.connect(start.value!, end.value!, {
    arrow: 'end',
    label: 'depends on',
    ...props.options
  });

  if (props.second) {
    arclace.connect(start.value!, other.value!, {
      arrow: 'end',
      ...props.second
    });
  }
});

onUnmounted(() => arclace?.destroy());
</script>

<template>
  <div ref="world" class="demo arc-canvas" :class="`demo-${variant}`">
    <div ref="start" class="node">Theme</div>
    <div class="column">
      <div v-if="second" ref="other" class="node other">Card</div>
      <div ref="end" class="node">Button</div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 160px;
  margin: 16px 0;
  padding: 20px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  --arc-color: var(--vp-c-text-2);
  --arc-label-color: var(--vp-c-text-1);
  --arc-label-bg: var(--arc-canvas-bg);
  --arc-anchor-fill: var(--arc-canvas-bg);
}

.node {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--arc-node-bg);
  color: var(--vp-c-text-1);
  box-shadow: var(--vp-shadow-2);
  font-size: 14px;
  font-weight: 600;
}

/* Button at the bottom right, Card above it */
.column {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  align-self: stretch;
}

.node.other {
  margin-bottom: auto;
}

/* Colour one connection */
.demo-important :deep(.arc-connection.important) {
  --arc-color: var(--vp-c-brand-1);
}

/* Dotted line: round caps turn zero-length dashes into dots */
.demo-dotted :deep(.arc-path) {
  stroke-dasharray: 0 8;
}

/* Label typography */
.demo-typography :deep(.arc-label) {
  --arc-label-color: var(--vp-c-brand-1);
  --arc-label-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Label badge */
.demo-badge :deep(.arc-connection.badge) {
  --arc-label-bg: var(--vp-c-brand-3);
  --arc-label-color: #fff;
  --arc-label-radius: 10px;
}

.demo-badge :deep(.arc-connection.badge .arc-label) {
  font-weight: 600;
}

/* Outlined label */
.demo-outlined :deep(.arc-label-bg) {
  --arc-label-border: var(--vp-c-divider);
  --arc-label-radius: 6px;
}

/* One label, by its connection's id */
.demo-individual :deep([data-arc-id='theme-card']) {
  /* Opaque, so the line stays behind it */
  --arc-label-bg: color-mix(
    in srgb,
    var(--vp-c-brand-1) 14%,
    var(--arc-canvas-bg)
  );
  --arc-label-color: var(--vp-c-brand-1);
  --arc-label-border: var(--vp-c-brand-1);
  --arc-label-radius: 12px;
  --arc-label-padding: 6px 12px;
}

/* Roomier padding, in em so it grows with the font */
.demo-padding :deep(.arc-connection) {
  --arc-label-size: 14px;
  --arc-label-padding: 0.4em 0.9em;
  --arc-label-border: var(--vp-c-divider);
}

/* Label in a monospace font, for code names */
.demo-code :deep(.arc-label) {
  font-family: var(--vp-font-family-mono);
  --arc-label-color: var(--vp-c-text-2);
}
</style>
