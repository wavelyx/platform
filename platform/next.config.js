/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  transpilePackages: ['openbook-v2'],
  webpack: (config, options) => {
    // Existing webpack rule for .svg files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Additional webpack configuration from the new settings
    if (!options.isServer) {
      config.resolve.fallback = { fs: false, ...config.resolve.fallback };
    }

    // If you have any more webpack customizations, merge them here before returning the config

    return config;
  },
};

module.exports = nextConfig;