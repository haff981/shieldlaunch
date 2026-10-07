"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ListedToken } from "./TokenList";

export default function TradingPanel({ token }: { token: ListedToken | null }) {
  const { publicKey } = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("100");

  const disabled = !token;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3">
        <div className="flex bg-shield-bg rounded-full p-1">
          {(["buy", "sell"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`flex-1 py-2 rounded-full font-extrabold text-sm ${
                side === s
                  ? "bg-white shadow text-shield-ink"
                  : "text-shield-muted"
              }`}
            >
              <span className={s === "buy" ? "text-green-600" : "text-red-500"}>
                {s === "buy" ? "Buy" : "Sell"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="bg-shield-bg rounded-2xl p-4">
          <div className="text-xs text-shield-muted mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold">$</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              disabled={disabled}
              className="w-full bg-transparent text-2xl font-extrabold outline-none disabled:opacity-40 font-mono"
              placeholder="0"
            />
            <span className="text-xs bg-white border border-shield-line rounded-full px-2 py-1 text-shield-muted shrink-0">
              USD
            </span>
          </div>
          <div className="text-xs text-shield-muted mt-1">
            {disabled ? "Enter an amount" : `≈ ${(Number(amount) / 118 / (token?.priceSol || 1)).toFixed(0)} $${token?.symbol}`}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {["10", "50", "100", "500", "Max"].map((v) => (
            <button
              key={v}
              onClick={() => v !== "Max" && setAmount(v)}
              disabled={disabled}
              className={`py-2 text-xs font-bold rounded-xl border ${
                amount === v
                  ? "border-shield-primary text-shield-primary bg-blue-50"
                  : "border-shield-line text-shield-muted bg-white"
              } disabled:opacity-40`}
            >
              {v === "Max" ? v : `$${v}`}
            </button>
          ))}
        </div>

        <button
          disabled={disabled}
          className={`w-full py-3.5 rounded-2xl font-extrabold ${
            disabled
              ? "bg-shield-bg text-shield-muted cursor-not-allowed"
              : side === "buy"
                ? "bg-shield-primary text-white hover:bg-shield-primaryDark"
                : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {disabled
            ? "No coin selected"
            : !publicKey
              ? "Connect wallet to trade"
              : side === "buy"
                ? `Buy $${token?.symbol}`
                : `Sell $${token?.symbol}`}
        </button>
        <div className="flex justify-between text-[11px] text-shield-muted">
          <span>0% platform fee · only Solana network fee</span>
          <span className="text-amber-600 font-bold">Slip 30%</span>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-shield-line">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-extrabold">Traders to follow</span>
          <span className="text-xs text-shield-primary font-bold">See all</span>
        </div>
        <p className="text-xs text-shield-muted">
          {token ? "跟单大神还没出现" : "People who trade on ShieldLaunch show up here to follow."}
        </p>
      </div>
    </div>
  );
}
