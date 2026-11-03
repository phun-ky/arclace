import { defineConfig } from 'eslint/config';
import customConfig from 'eslint-config-phun-ky';

export default defineConfig([
  {
    ignores: ['dist/**', 'docs/api/**', 'coverage/**']
  },
  {
    extends: [customConfig]
  },
  {
    rules: {
      // Crashes under flat config ("couldn't find a configuration file")
      'import/no-unused-modules': 'off'
    }
  },
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript already checks for undefined names, including DOM types
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.md'],
    rules: {
      'no-irregular-whitespace': 'off',
      '@stylistic/indent': 'off'
    }
  }
]);
