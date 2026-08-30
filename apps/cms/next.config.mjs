import { withPayload } from "@payloadcms/next/withPayload"

const publicHost = process.env.PUBLIC_HOST || "127.0.0.1"

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [publicHost],
  reactStrictMode: true,
}

export default withPayload(nextConfig)
