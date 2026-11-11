/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGitHubPagesProject = Boolean(repoName);

const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  basePath: isGitHubPagesProject ? `/${repoName}` : "",
  assetPrefix: isGitHubPagesProject ? `/${repoName}` : "",
  trailingSlash: true,
};

export default nextConfig;
