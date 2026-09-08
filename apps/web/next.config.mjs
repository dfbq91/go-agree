/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@go-agree/domain', '@go-agree/application', '@go-agree/infrastructure'],
};

export default nextConfig;
