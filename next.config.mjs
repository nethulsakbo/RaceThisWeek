/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  basePath: process.env.NEXT_BASE_PATH ?? "",
  assetPrefix: process.env.NEXT_BASE_PATH || undefined,
  trailingSlash: true,
};

export default nextConfig;
