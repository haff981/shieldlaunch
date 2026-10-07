"use client";

/**
 * Irys（Arweave）永久存储：代币图片 + metadata JSON
 * Solana 原生，无需 API key，钱包直接签名充值。
 * 余额是持久的，一次充值多次发币可用。
 */
import type { WebIrys as WebIrysType } from "@irys/sdk";
import type { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";

let cached: WebIrysType | null = null;

export async function getIrys(
  wallet: MessageSignerWalletAdapter,
  rpcUrl: string
): Promise<WebIrysType> {
  if (cached) return cached;
  // 动态导入：SDK 体积大且仅浏览器可用，避免 SSR
  const { WebIrys } = await import("@irys/sdk");
  const irys = new WebIrys({
    network: "mainnet",
    token: "solana",
    wallet: { provider: wallet as unknown as object, rpcUrl },
  });
  await irys.ready();
  cached = irys;
  return irys;
}

/** 确保 Irys 余额足够上传指定字节数，不够则发起充值（需钱包签名一次） */
export async function ensureFunded(
  irys: WebIrysType,
  bytes: number
): Promise<void> {
  const price = await irys.getPrice(bytes);
  const balance = await irys.getLoadedBalance();
  if (balance.isLessThan(price)) {
    const need = price.minus(balance);
    // 多充 20% 做缓冲，免得下次还得签
    await irys.fund(need.multipliedBy(1.2).integerValue());
  }
}

export async function uploadImage(
  irys: WebIrysType,
  file: File
): Promise<string> {
  // Web SDK 的 uploadFile 直接接受浏览器 File
  const receipt = await irys.uploadFile(file, {
    tags: [{ name: "Content-Type", value: file.type || "image/png" }],
  });
  return `https://gateway.irys.xyz/${receipt.id}`;
}

export async function uploadMetadata(
  irys: WebIrysType,
  meta: { name: string; symbol: string; description: string; image: string }
): Promise<string> {
  const file = new File([JSON.stringify(meta)], "metadata.json", {
    type: "application/json",
  });
  const receipt = await irys.uploadFile(file, {
    tags: [{ name: "Content-Type", value: "application/json" }],
  });
  return `https://gateway.irys.xyz/${receipt.id}`;
}
