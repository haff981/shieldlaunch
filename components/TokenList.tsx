"use client";

export interface ListedToken {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  priceSol: number;
  mcapUsd: number;
  change24h: number;
  progressPct: number; // 毕业进度 0–100
}

export default function TokenList({
  tokens,
  selected,
  onSelect,
}: {
  tokens: ListedToken[];
  selected: string | null;
  onSelect: (mint: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 p-2 border-b border-white/10">
        {["新币", "热门"].map((t, i) => (
          <button
            key={t}
            className={`flex-1 text-sm py-1.5 rounded-lg ${
              i === 0 ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">
            <div className="text-3xl mb-2">🛡️</div>
            还没有代币发射
            <br />
            成为第一个发币的人
          </div>
        ) : (
          tokens.map((t) => (
            <button
              key={t.mint}
              onClick={() => onSelect(t.mint)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-white/5 hover:bg-white/5 text-left ${
                selected === t.mint ? "bg-white/5 border-l-2 border-l-shield-neon" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-shield-panel border border-white/10 flex items-center justify-center text-lg shrink-0">
                {t.image ? <img src={t.image} alt="" className="w-9 h-9 rounded-full" /> : "🪙"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate">{t.name}</span>
                  <span className="text-xs text-white/40">${t.symbol}</span>
                </div>
                <div className="text-xs text-white/40">
                  ${t.mcapUsd >= 1000 ? (t.mcapUsd / 1000).toFixed(1) + "K" : t.mcapUsd.toFixed(0)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xs font-mono ${t.change24h >= 0 ? "text-shield-neon" : "text-red-400"}`}>
                  {t.change24h >= 0 ? "+" : ""}
                  {t.change24h.toFixed(1)}%
                </div>
                <div className="w-14 h-1 bg-white/10 rounded-full mt-1">
                  <div
                    className="h-1 bg-shield-neon rounded-full"
                    style={{ width: `${Math.min(100, t.progressPct)}%` }}
                  />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
