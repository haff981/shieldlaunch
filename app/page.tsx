"use client";

import { useState } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";
import TokenList, { type ListedToken } from "@/components/TokenList";
import TradingPanel from "@/components/TradingPanel";

// config 建好、首币发射后，这里接真实链上/索引数据
const TOKENS: ListedToken[] = [];

export default function Home() {
  const [selectedMint, setSelectedMint] = useState<string | null>(null);
  const selected = TOKENS.find((t) => t.mint === selectedMint) ?? null;

  return (
    <main className="h-screen flex flex-col bg-shield-bg">
      {/* 顶栏 */}
      <nav className="flex items-center gap-4 px-4 py-3 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold text-shield-neon shrink-0">
          🛡️ ShieldLaunch
        </Link>
        <div className="flex-1 max-w-md">
          <input
            placeholder="搜索代币 / mint 地址…"
            className="w-full bg-shield-panel border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-shield-neon placeholder:text-white/25"
          />
        </div>
        <div className="flex-1" />
        <Link
          href="/launch"
          className="text-sm font-bold bg-shield-neon text-black px-4 py-2 rounded-lg hover:opacity-90 shrink-0"
        >
          ＋ 发币
        </Link>
        <WalletButton />
      </nav>

      {/* 三栏终端 */}
      <div className="flex-1 flex min-h-0">
        {/* 左：代币列表 */}
        <aside className="w-72 shrink-0 border-r border-white/10 bg-shield-panel/50 hidden md:flex flex-col">
          <TokenList tokens={TOKENS} selected={selectedMint} onSelect={setSelectedMint} />
        </aside>

        {/* 中：代币详情 */}
        <section className="flex-1 min-w-0 flex flex-col">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-shield-panel border border-white/10 flex items-center justify-center text-2xl">
                    🪙
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {selected.name}{" "}
                      <span className="text-white/40 text-sm">${selected.symbol}</span>
                    </div>
                    <div className="text-xs text-white/40 font-mono">
                      {selected.mint.slice(0, 6)}…{selected.mint.slice(-6)}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="text-right">
                    <div className="text-xl font-mono font-bold">
                      {selected.priceSol.toFixed(6)} SOL
                    </div>
                    <div
                      className={`text-sm ${selected.change24h >= 0 ? "text-shield-neon" : "text-red-400"}`}
                    >
                      {selected.change24h >= 0 ? "+" : ""}
                      {selected.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 mt-3 text-sm">
                  {[
                    ["市值", `$${selected.mcapUsd.toLocaleString()}`],
                    ["毕业进度", `${selected.progressPct.toFixed(1)}%`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="text-white/35 text-xs">{k} </span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-white/25 text-sm">
                K 线图接 DexScreener/GMGN（首币发射后接入）
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h1 className="text-2xl font-bold mb-2">
                在 Solana 上<span className="text-shield-neon">发射</span>你的 Meme
              </h1>
              <p className="text-white/50 text-sm mb-6 max-w-md">
                Meteora 动态联合曲线 · $5K 开盘 → $15K 毕业迁移 DAMM v2 ·
                毕业后 LP 永久锁定 · 发币人分成 0–9% 自选
              </p>
              <Link
                href="/launch"
                className="bg-shield-neon text-black font-bold px-8 py-3.5 rounded-xl hover:opacity-90"
              >
                立即发币 →
              </Link>
              <p className="mt-4 text-xs text-white/25">主网模式 · 真实 SOL</p>
            </div>
          )}
        </section>

        {/* 右：交易面板 */}
        <aside className="w-80 shrink-0 border-l border-white/10 bg-shield-panel/50 hidden lg:block">
          <TradingPanel token={selected} />
        </aside>
      </div>

      {/* 移动端：列表抽屉简化 */}
      <div className="md:hidden border-t border-white/10 max-h-48 overflow-y-auto">
        <TokenList tokens={TOKENS} selected={selectedMint} onSelect={setSelectedMint} />
      </div>
    </main>
  );
}
