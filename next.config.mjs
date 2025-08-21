/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  env: {
    NEXT_PUBLIC_MESSAGE_BASE_URL: process.env.NEXT_PUBLIC_MESSAGE_BASE_URL,
    NEXT_PUBLIC_DASHBOARD_BASE_URL: process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL,
    NEXT_PUBLIC_PHONEBOOK_BASE_URL: process.env.NEXT_PUBLIC_PHONEBOOK_BASE_URL,
    NEXT_PUBLIC_AGENT_BASE_URL: process.env.NEXT_PUBLIC_AGENT_BASE_URL,
  },
}

export default nextConfig
