// @ts-check

import createMDX from '@next/mdx'
import rehypeShiki from '@shikijs/rehype'

const withMDX = createMDX({
  options: {
    jsxImportSource: '@/mdx-rsc-runtime',
    rehypePlugins: [
      [
        rehypeShiki,
        {
          langs: ['glsl', 'ts', 'tsx', 'js', 'jsx', 'bash', 'diff', 'json'],
          theme: 'github-dark',
        },
      ],
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactCompiler: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader'],
    })
    return config
  },
}

export default withMDX(nextConfig)
