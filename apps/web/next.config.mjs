/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@go-agree/domain', '@go-agree/application', '@go-agree/infrastructure'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        async_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
