"use client";

import { useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import StatusBar from "@/components/StatusBar";
import TokenList, { type ListedToken } from "@/components/TokenList";
import TradingPanel from "@/components/TradingPanel";

// config 建好、首币发射后，这里接真实链上/索引数据
const TOKENS: ListedToken[] = [];

export default function Home() {
  const [selectedMint, setSelectedMint] = useState<string | null>(null);
  const selected = TOKENS.find((t) => t.mint === selectedMint) ?? null;

  return (
    <main className="h-screen flex flex-col bg-shield-bg">
      <TopNav />

      <div className="flex-1 flex min-h-0 gap-3 p-3">
        {/* 左：Markets */}
        <aside className="w-64 shrink-0 rounded-2xl border border-shield-line overflow-hidden hidden md:flex flex-col">
          <TokenList tokens={TOKENS} selected={selectedMint} onSelect={setSelectedMint} />
        </aside>

        {/* 中：图表区 */}
        <section className="flex-1 min-w-0 rounded-2xl bg-white border border-shield-line flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-shield-line">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-shield-bg border border-shield-line flex items-center justify-center text-2xl">
                    🪙
                  </div>
                  <div>
                    <div className="font-extrabold text-lg text-shield-ink">
                      ${selected.symbol}
                      <span className="ml-2 text-xs font-bold text-shield-muted">
                        {selected.name}
                      </span>
                    </div>
                    <div className="text-xs text-shield-muted font-mono">
                      {selected.mint.slice(0, 6)}…{selected.mint.slice(-6)}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-shield-primary border border-blue-100">
                      SOL · Meteora bonding curve
                    </span>
                  </div>
                </div>
                <div className="flex gap-6 mt-3 text-sm">
                  <div>
                    <div className="text-[11px] text-shield-muted">Price</div>
                    <div className="font-mono font-bold">
                      {selected.priceSol.toFixed(6)} SOL
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-shield-muted">Market cap</div>
                    <div className="font-mono font-bold">
                      ${(selected.mcapUsd / 1000).toFixed(1)}K
                      <span
                        className={`ml-1 text-xs ${selected.change24h >= 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {selected.change24h >= 0 ? "+" : ""}
                        {selected.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-shield-muted">毕业进度</div>
                    <div className="font-mono font-bold text-shield-primary">
                      {selected.progressPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-shield-muted text-sm">
                K 线图（首币发射后接入）
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="bg-shield-bg rounded-2xl px-10 py-8">
                <div className="text-4xl mb-3">🛡️</div>
                <div className="font-extrabold text-lg mb-4">还没有代币上线</div>
                <Link
                  href="/launch"
                  className="inline-block bg-shield-primary text-white font-extrabold px-6 py-2.5 rounded-full hover:bg-shield-primaryDark"
                >
                  🚀 Launch the first coin
                </Link>
              </div>
              <p className="mt-4 text-xs text-shield-muted max-w-sm">
                Meteora 动态联合曲线 · $5K 开盘 → $15K 毕业迁移 DAMM v2 ·
                毕业后 LP 永久锁定 · 发币人分成 0–9% 自选
              </p>
            </div>
          )}
        </section>

        {/* 右：交易面板 */}
        <aside className="w-80 shrink-0 rounded-2xl border border-shield-line overflow-hidden hidden lg:block">
          <TradingPanel token={selected} />
        </aside>
      </div>

      {/* 移动端列表 */}
      <div className="md:hidden mx-3 mb-3 rounded-2xl border border-shield-line overflow-hidden max-h-56">
        <TokenList tokens={TOKENS} selected={selectedMint} onSelect={setSelectedMint} />
      </div>

      <StatusBar />
    </main>
  );
}
