const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    const rpcWebsocketsDistDir = path.dirname(require.resolve("rpc-websockets"));

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "rpc-websockets$": path.join(rpcWebsocketsDistDir, "index.browser.cjs"),
      "postcss$": require.resolve("postcss"),
    };

    return config;
  },
};

module.exports = nextConfig;
