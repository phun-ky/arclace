import type { Theme } from 'vitepress';
// Without fonts: the site loads nothing from other origins
import DefaultTheme from 'vitepress/theme-without-fonts';

import Playground from './components/Playground.vue';
import StyleDemo from './components/StyleDemo.vue';
import './custom.css';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    // Keep the default theme's global components (such as <Badge>)
    DefaultTheme.enhanceApp?.(ctx);
    ctx.app.component('Playground', Playground);
    ctx.app.component('StyleDemo', StyleDemo);
  }
} satisfies Theme;
