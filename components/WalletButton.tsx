"use client";

import dynamic from "next/dynamic";

// WalletMultiButton 不支持 SSR（预渲染时会因 createContext 崩掉），
// 必须用 ssr:false 做成纯客户端组件。
export const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="bg-shield-neon/20 text-shield-neon font-semibold px-4 py-2 rounded-lg text-sm cursor-wait"
      >
        连接钱包
      </button>
    ),
  }
);
