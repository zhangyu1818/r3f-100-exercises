import { defineOxfmtConfig } from '@zhangyu1818/oxlint-config'

export default defineOxfmtConfig({
  ignorePatterns: ['out/**/*', 'coverage/**/*', '**/*.mdx'],
  presets: {
    imports: true,
    packageJson: true,
    tailwindcss: {
      options: {
        functions: ['clsx', 'twMerge'],
        stylesheet: './src/app/globals.css',
      },
    },
  },
})
