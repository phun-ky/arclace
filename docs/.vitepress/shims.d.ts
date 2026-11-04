// Single-file components, for typechecking the theme with tsc
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent;

  export default component;
}
