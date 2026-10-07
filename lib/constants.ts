import { PublicKey } from "@solana/web3.js";

/**
 * ShieldLaunch 全局常量
 * 用户决策（2026-10-07）：直接上主网。
 */

// 平台费归集钱包（用户提供，格式已验证）
export const PLATFORM_FEE_WALLET = new PublicKey(
  "E2qxycbv64fZH5pPNx89qZdc7JLy6WgquskvJFxjt6Ro"
);

// Meteora Dynamic Bonding Curve 程序 ID（主网与 devnet 通用）
export const DBC_PROGRAM_ID = new PublicKey(
  "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"
);

// WSOL（报价币）
export const WSOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

// Solana 销毁地址（LP 燃烧用）
export const INCINERATOR = new PublicKey(
  "1nc1nerator11111111111111111111111111111111"
);

// 主网 RPC（Helius/QuickNode 免费 key 填到 .env → NEXT_PUBLIC_MAINNET_RPC）
export const MAINNET_RPC = "https://api.mainnet-beta.solana.com";

// 平台 configs：10 档费率各一个，key = 发币人分成档位 0–9
// 建好后把真实地址填进来（每档创建约 0.006 SOL，必须用户钱包签名）
const PLACEHOLDER = "11111111111111111111111111111111";
export const PLATFORM_CONFIGS_MAINNET: Record<number, string> = {
  0: PLACEHOLDER,
  1: PLACEHOLDER,
  2: PLACEHOLDER,
  3: PLACEHOLDER,
  4: PLACEHOLDER,
  5: PLACEHOLDER,
  6: PLACEHOLDER,
  7: PLACEHOLDER,
  8: PLACEHOLDER,
  9: PLACEHOLDER,
};
