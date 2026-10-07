"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { buildCreatePoolTx, FEE_TIERS } from "@/lib/meteora";

export default function LaunchPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");
  const [tier, setTier] = useState(5); // 发币人分成档位 0–9，默认 5%
  const [burnLp, setBurnLp] = useState(false); // 燃烧选项
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const fee = FEE_TIERS[tier];

  async function handleLaunch() {
    if (!publicKey) {
      setStatus("请先连接钱包");
      return;
    }
    if (!name || !symbol) {
      setStatus("请填写名称和 ticker");
      return;
    }
    setBusy(true);
    setStatus("组装交易中…（主网，真实 SOL）");
    try {
      // TODO: 图片上传 + metadata JSON（Irys/Arweave），uri 填入
      const uri = "https://shieldlaunch.life/api/metadata/placeholder.json";
      const { tx, baseMint } = await buildCreatePoolTx({
        connection,
        payer: publicKey,
        poolCreator: publicKey,
        tier,
        name,
        symbol: symbol.toUpperCase(),
        uri,
        burnLp,
      });
      setStatus("请在钱包中签名…（主网交易，谨慎确认）");
      const sig = await sendTransaction(tx, connection);
      setStatus(
        `发射成功！mint: ${baseMint.toBase58()} 签名：${sig}\n下一步：renounce mint/freeze 权限，然后到 GMGN 搜 mint 地址验证被捕捉。`
      );
    } catch (e: unknown) {
      setStatus(`失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-shield-bg">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-shield-neon">
          🛡️ ShieldLaunch
        </Link>
        <WalletMultiButton />
      </nav>

      <section className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">发射代币</h1>
        <p className="text-white/50 text-sm mb-8">
          Meteora DBC · 固定 10 亿供应 · 毕业迁移 DAMM v2
          <span className="text-red-400"> · 主网模式（真实 SOL）</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60">名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shield Dog"
              className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 outline-none border border-white/10 focus:border-shield-neon"
            />
          </div>
          <div>
            <label className="text-sm text-white/60">Ticker</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="SHIELD"
              className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 outline-none border border-white/10 focus:border-shield-neon"
            />
          </div>
          <div>
            <label className="text-sm text-white/60">简介</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="一句话介绍你的 meme…"
              className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 outline-none border border-white/10 focus:border-shield-neon"
              rows={3}
            />
          </div>

          <div className="bg-shield-panel rounded-lg p-4">
            <label className="text-sm text-white/60">
              发币人分成：<span className="text-shield-neon font-bold">{tier}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={9}
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <div className="text-xs text-white/40 mt-2 space-y-1">
              <p>池子总费率：{fee.totalFeePct.toFixed(2)}%</p>
              <p>发币人拿：{fee.creatorPct}% · 平台拿：~{fee.platformPct}% · Meteora 协议：20%</p>
              <p>平台费自动归集到 E2qx…t6Ro</p>
            </div>
          </div>

          <label className="flex items-start gap-3 bg-shield-panel rounded-lg p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={burnLp}
              onChange={(e) => setBurnLp(e.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <span>
              <span className="text-sm font-bold">🔥 燃烧 LP</span>
              <span className="block text-xs text-white/40 mt-1">
                毕业后将流动性凭证打入销毁地址（而非锁仓），彻底杜绝跑路嫌疑，传播时更有说服力
              </span>
            </span>
          </label>

          <button
            onClick={handleLaunch}
            disabled={busy}
            className="w-full bg-shield-neon text-black font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "处理中…" : "🚀 发射（主网）"}
          </button>

          {status && (
            <p className="text-sm text-white/60 break-all bg-shield-panel rounded-lg p-4 whitespace-pre-wrap">
              {status}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
