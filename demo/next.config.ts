import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'

const config: NextConfig = {
  transpilePackages: ['@luokui/ui'],
  devIndicators: false,
  images: { unoptimized: true },
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) }
}

export default config
