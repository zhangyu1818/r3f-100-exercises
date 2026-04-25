import { defineConfig } from '@zhangyu1818/oxlint-config'

export default defineConfig({
  ignorePatterns: [
    'out/**/*',
    'coverage/**/*',
    '**/*.mdx',
    '**/*.typeface.json',
    '.claude/**/*',
    '.agents/**/*',
  ],
  presets: {
    react: {
      rules: {
        'react/no-unknown-property': 'off',
      },
    },
    typescript: {
      options: {
        typeAware: true,
      },
    },
  },
})
