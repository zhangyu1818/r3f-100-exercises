// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'export',
  webpack(config) {
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['raw-loader'],
    })
    return config
  },
}

export default nextConfig
