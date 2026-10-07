"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";
import { buildCreatePoolTx, FEE_TIERS } from "@/lib/meteora";

export default function LaunchPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tier, setTier] = useState(5);
  const [burnLp, setBurnLp] = useState(false);
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
      // metadata：图片用粘贴的 URL，JSON 走 Irys 上传（待接）；当前为占位
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
        `发射成功！mint: ${baseMint.toBase58()}\n签名：${sig}\n下一步：renounce mint/freeze 权限，然后到 GMGN 搜 mint 地址验证被捕捉。`
      );
    } catch (e: unknown) {
      setStatus(`失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-shield-bg">
      <nav className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-shield-neon">
          🛡️ ShieldLaunch
        </Link>
        <div className="flex-1" />
        <WalletButton />
      </nav>

      <section className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">发射代币</h1>
        <p className="text-white/40 text-sm mb-6">
          Meteora DBC · 10 亿固定供应 · $5K 开盘 → $15K 毕业迁移 DAMM v2
          <span className="text-red-400"> · 主网（真实 SOL）</span>
        </p>

        <div className="space-y-4">
          {/* 头图 */}
          <div className="flex gap-4">
            <div className="w-24 h-24 shrink-0 rounded-xl bg-shield-panel border border-dashed border-white/20 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="w-24 h-24 object-cover" />
              ) : (
                <span className="text-3xl text-white/20">🖼️</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm text-white/60">代币图片 URL</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…（png/jpg，粘贴图片直链）"
                className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 text-sm outline-none border border-white/10 focus:border-shield-neon placeholder:text-white/25"
              />
              <p className="text-xs text-white/30 mt-1">发推时传图，复制图片地址粘这里</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/60">名称 *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shield Dog"
                className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 outline-none border border-white/10 focus:border-shield-neon placeholder:text-white/25"
              />
            </div>
            <div>
              <label className="text-sm text-white/60">Ticker *</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="SHIELD"
                maxLength={10}
                className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 outline-none border border-white/10 focus:border-shield-neon placeholder:text-white/25 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60">简介</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="一句话介绍你的 meme…"
              rows={2}
              className="mt-1 w-full bg-shield-panel rounded-lg px-4 py-3 outline-none border border-white/10 focus:border-shield-neon placeholder:text-white/25"
            />
          </div>

          {/* 分成档位 */}
          <div className="bg-shield-panel rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm text-white/60">发币人分成</label>
              <span className="text-shield-neon font-bold text-xl">{tier}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={9}
              step={1}
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              className="w-full accent-[#39ff88]"
            />
            <div className="flex justify-between text-[11px] text-white/30 mt-1 px-0.5">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setTier(i)}
                  className={i === tier ? "text-shield-neon font-bold" : "hover:text-white/60"}
                >
                  {i}%
                </button>
              ))}
            </div>
            <div className="text-xs text-white/40 mt-3 pt-3 border-t border-white/10 space-y-1">
              <div className="flex justify-between">
                <span>池子总费率</span>
                <span className="font-mono text-white/70">{fee.totalFeePct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>你拿 / 平台拿 / Meteora</span>
                <span className="font-mono text-white/70">
                  {fee.creatorPct}% / ~{fee.platformPct}% / 20%
                </span>
              </div>
              <div className="flex justify-between">
                <span>平台费归集</span>
                <span className="font-mono text-white/70">E2qx…t6Ro</span>
              </div>
            </div>
          </div>

          {/* 燃烧 LP */}
          <label className="flex items-start gap-3 bg-shield-panel rounded-xl p-4 border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={burnLp}
              onChange={(e) => setBurnLp(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#39ff88]"
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
            className="w-full bg-shield-neon text-black font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-40 text-lg"
          >
            {busy ? "处理中…" : "🚀 发射（主网）"}
          </button>

          {status && (
            <p className="text-sm text-white/60 break-all bg-shield-panel border border-white/10 rounded-xl p-4 whitespace-pre-wrap">
              {status}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
