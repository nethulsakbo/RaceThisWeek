/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  basePath: isProd ? "/RaceThisWeek" : "",
  trailingSlash: true,
};

export default nextConfig;
