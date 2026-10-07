"use client";

export interface ListedToken {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  priceSol: number;
  mcapUsd: number;
  change24h: number;
  progressPct: number;
  feeTier?: number;
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex gap-1 p-2">
        {["Trending", "新币"].map((t, i) => (
          <button
            key={t}
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              i === 0
                ? "bg-shield-bg text-shield-ink"
                : "text-shield-muted hover:text-shield-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="px-3 pb-2 text-xs text-shield-muted flex items-center justify-between">
        <span>
          {tokens.length} markets · <span className="text-green-600">● Live</span>
        </span>
        <span className="flex gap-2">
          <span>MC</span>
          <span>Chg</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tokens.length === 0 ? (
          <div className="p-6 text-center text-shield-muted text-sm">
            <div className="text-4xl mb-3">🛡️</div>
            <div className="font-bold text-shield-ink mb-1">还没有代币</div>
            成为第一个发币的人
          </div>
        ) : (
          tokens.map((t) => (
            <button
              key={t.mint}
              onClick={() => onSelect(t.mint)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-shield-line/60 hover:bg-shield-bg/60 text-left ${
                selected === t.mint ? "bg-blue-50 border-l-2 border-l-shield-primary" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-shield-bg border border-shield-line flex items-center justify-center text-lg shrink-0 overflow-hidden">
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  "🪙"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold truncate text-shield-ink">
                  ${t.symbol}
                </div>
                <div className="text-xs text-shield-muted truncate">
                  {t.priceSol.toFixed(6)} SOL
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono text-shield-ink">
                  ${(t.mcapUsd / 1000).toFixed(1)}K
                </div>
                <div
                  className={`text-xs font-mono ${t.change24h >= 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {t.change24h >= 0 ? "+" : ""}
                  {t.change24h.toFixed(1)}%
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
