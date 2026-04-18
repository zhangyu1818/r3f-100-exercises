import { defineConfig } from '@zhangyu1818/oxlint-config'

export default defineConfig({
  ignorePatterns: ['out/**/*', '**/*.typeface.json'],
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx', '**/*.mtsx', '**/*.ctsx'],
      rules: {
        'max-lines': 'off',
      },
    },
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
