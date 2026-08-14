import { withPayload } from "@payloadcms/next/withPayload"

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["203.88.118.104"],
  reactStrictMode: true,
}

export default withPayload(nextConfig)
