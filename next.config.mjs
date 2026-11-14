/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
