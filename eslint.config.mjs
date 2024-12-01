import { defineConfig } from '@zhangyu1818/eslint-config'

export default defineConfig(
  {
    presets: {
      prettier: true,
      tailwindcss: true,
    },
  },
  [
    {
      rules: {
        'react/no-unknown-property': 'off',
      },
    },
    {
      ignores: ['out/**/*'],
    },
    {
      ignores: ['**/*.typeface.json'],
    },
  ],
)
