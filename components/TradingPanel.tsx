"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ListedToken } from "./TokenList";

export default function TradingPanel({ token }: { token: ListedToken | null }) {
  const { publicKey } = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1");

  const disabled = !token;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-2">
          {(["buy", "sell"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`flex-1 py-2 rounded-lg font-bold text-sm ${
                side === s
                  ? s === "buy"
                    ? "bg-shield-neon text-black"
                    : "bg-red-500 text-white"
                  : "bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              {s === "buy" ? "买入" : "卖出"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>数量 (SOL)</span>
            <span>余额：{publicKey ? "—" : "未连接"}</span>
          </div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            disabled={disabled}
            className="w-full bg-shield-bg border border-white/10 rounded-lg px-4 py-3 text-lg font-mono outline-none focus:border-shield-neon disabled:opacity-40"
            placeholder="0.0"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["0.1", "0.5", "1", "5"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              disabled={disabled}
              className="py-1.5 text-xs bg-white/5 rounded-lg text-white/60 hover:bg-white/10 disabled:opacity-40"
            >
              {v}
            </button>
          ))}
        </div>

        <div className="text-xs text-white/40">
          ≈ {disabled ? "—" : "0"} ${token?.symbol ?? ""}
        </div>

        <button
          disabled={disabled}
          className={`w-full py-3.5 rounded-xl font-bold ${
            disabled
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : side === "buy"
                ? "bg-shield-neon text-black hover:opacity-90"
                : "bg-red-500 text-white hover:opacity-90"
          }`}
        >
          {disabled ? "等待首个代币" : side === "buy" ? `买入 $${token?.symbol}` : `卖出 $${token?.symbol}`}
        </button>

        {!disabled && (
          <div className="text-xs text-white/30 space-y-1">
            <div className="flex justify-between">
              <span>滑点</span>
              <span>1%</span>
            </div>
            <div className="flex justify-between">
              <span>池子费率</span>
              <span>—</span>
            </div>
          </div>
        )}
      </div>

      {token && (
        <div className="p-4 border-t border-white/10 text-xs text-white/40 space-y-1.5">
          <div className="text-white/70 font-bold text-sm mb-2">代币信息</div>
          <div className="flex justify-between">
            <span>Mint</span>
            <span className="font-mono">
              {token.mint.slice(0, 4)}…{token.mint.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>市值</span>
            <span>${token.mcapUsd.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>毕业进度</span>
            <span className="text-shield-neon">{token.progressPct.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
