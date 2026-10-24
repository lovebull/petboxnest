import { withPayload } from "@payloadcms/next/withPayload"

const publicHost = process.env.PUBLIC_HOST || "127.0.0.1"

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  allowedDevOrigins: [publicHost],
  reactStrictMode: true,
}

// 下面生产环境的时候
export default withPayload(nextConfig)

// 下面是开发环境使用，解决payload cms一直重启问题，生产环境的时候注释掉下面
// export default withPayload(nextConfig, {
//   devBundleServerPackages: false,
// })
