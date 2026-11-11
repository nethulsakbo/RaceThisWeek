/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: { unoptimized: true },
  // For GitHub Pages sub-path: set basePath if repo is not at root
  // basePath: '/RaceThisWeek', // uncomment if deploying to username.github.io/RaceThisWeek
  trailingSlash: true,
};
export default nextConfig;
