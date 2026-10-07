import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 钱包 adapter 需要的 polyfill 由 @solana/wallet-adapter 处理
  webpack: (config) => config,
};

export default nextConfig;
