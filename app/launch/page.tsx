"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import TopNav from "@/components/TopNav";
import StatusBar from "@/components/StatusBar";
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

  const inputCls =
    "mt-1 w-full bg-white rounded-xl px-4 py-3 outline-none border border-shield-line focus:border-shield-primary placeholder:text-shield-muted/60 text-shield-ink";

  return (
    <main className="min-h-screen flex flex-col bg-shield-bg">
      <TopNav />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* 标题 + 数据 */}
        <div className="bg-white rounded-2xl border border-shield-line p-6 mb-4">
          <div className="inline-block text-xs font-bold text-shield-primary bg-blue-50 rounded-full px-3 py-1 mb-2">
            ● Launch console
          </div>
          <h1 className="text-3xl font-extrabold text-shield-ink">Launch a coin</h1>
          <p className="text-shield-muted text-sm mt-1 max-w-2xl">
            你的币跑在自己的 Meteora 联合曲线上，与 SOL 配对。约 $15K
            市值毕业，迁移到流动性永久锁定的池子。发币人分成你自己定。
          </p>
        </div>

        <div className="flex gap-4 items-start">
          {/* 左：表单 */}
          <section className="flex-1 bg-white rounded-2xl border border-shield-line p-6">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-extrabold text-shield-ink">Coin logo</label>
                <div className="flex gap-4 mt-2">
                  <div className="w-24 h-24 shrink-0 rounded-2xl bg-shield-bg border-2 border-dashed border-shield-line flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="" className="w-24 h-24 object-cover" />
                    ) : (
                      <span className="text-2xl">🖼️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="粘贴图片直链 https://…"
                      className={inputCls + " text-sm"}
                    />
                    <p className="text-xs text-shield-muted mt-1">
                      发推时传图，复制图片地址粘这里（JPG/PNG/GIF/WebP）
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-extrabold text-shield-ink">Coin name</label>
                  <span className="text-xs text-shield-muted">{name.length}/32</span>
                </div>
                <input
                  value={name}
                  maxLength={32}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Shown on the card and in search"
                  className={inputCls}
                />
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-extrabold text-shield-ink">Ticker</label>
                  <span className="text-xs text-shield-muted">{symbol.length}/10</span>
                </div>
                <input
                  value={symbol}
                  maxLength={10}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="Up to 10 letters and numbers"
                  className={inputCls + " font-mono"}
                />
              </div>

              <div>
                <label className="text-sm font-extrabold text-shield-ink">Supply</label>
                <p className="text-xs text-shield-muted mb-1">
                  每种币固定不变，mint 权限同步撤销
                </p>
                <div className="relative">
                  <input
                    value="1,000,000,000"
                    disabled
                    className={inputCls + " font-mono opacity-70"}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600">
                    ✓ Fixed
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-extrabold text-shield-ink">Description</label>
                  <span className="text-xs text-shield-muted">{desc.length}/240</span>
                </div>
                <textarea
                  value={desc}
                  maxLength={240}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What your coin is about, in a line or two."
                  rows={2}
                  className={inputCls}
                />
              </div>

              {/* 分成 */}
              <div className="bg-shield-bg rounded-2xl p-4">
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-sm font-extrabold text-shield-ink">
                    发币人分成（Creator fee）
                  </label>
                  <span className="text-shield-primary font-extrabold text-2xl">{tier}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={9}
                  step={1}
                  value={tier}
                  onChange={(e) => setTier(Number(e.target.value))}
                  className="w-full accent-[#2563eb]"
                />
                <div className="flex justify-between text-[11px] text-shield-muted mt-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setTier(i)}
                      className={
                        i === tier
                          ? "text-shield-primary font-extrabold"
                          : "hover:text-shield-ink"
                      }
                    >
                      {i}%
                    </button>
                  ))}
                </div>
                <div className="text-xs text-shield-muted mt-2">
                  池子总费率 {fee.totalFeePct.toFixed(2)}% · 你拿 {fee.creatorPct}% ·
                  平台 ~{fee.platformPct}% · Meteora 20%
                </div>
              </div>

              <label className="flex items-start gap-3 bg-shield-bg rounded-2xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={burnLp}
                  onChange={(e) => setBurnLp(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#2563eb]"
                />
                <span>
                  <span className="text-sm font-extrabold text-shield-ink">🔥 燃烧 LP</span>
                  <span className="block text-xs text-shield-muted mt-1">
                    毕业后将流动性凭证打入销毁地址（而非锁仓），彻底杜绝跑路嫌疑，传播时更有说服力
                  </span>
                </span>
              </label>

              <button
                onClick={handleLaunch}
                disabled={busy}
                className="w-full bg-shield-primary text-white font-extrabold py-4 rounded-2xl hover:bg-shield-primaryDark disabled:opacity-40 text-lg"
              >
                {busy ? "处理中…" : "🚀 发射（主网）"}
              </button>

              {status && (
                <p className="text-sm text-shield-ink break-all bg-shield-bg border border-shield-line rounded-2xl p-4 whitespace-pre-wrap">
                  {status}
                </p>
              )}
            </div>
          </section>

          {/* 右：实时预览 + 费用 */}
          <aside className="w-72 shrink-0 space-y-4 hidden lg:block sticky top-20">
            <div>
              <div className="text-xs font-bold text-shield-muted mb-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                Live preview
              </div>
              <div className="bg-white rounded-2xl border border-shield-line overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow" />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-amber-400 border-4 border-white shadow flex items-center justify-center text-white font-extrabold text-xl">
                      {(symbol || "GO").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-extrabold text-shield-ink">
                    {name || "Your coin"}{" "}
                    <span className="text-shield-muted text-sm font-bold">
                      ${symbol || "TICKER"}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {["Paired SOL", "Solana", `Fee ${fee.totalFeePct.toFixed(2)}%`].map((b) => (
                      <span
                        key={b}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-shield-primary"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-3 pt-3 border-t border-shield-line">
                    <span className="text-shield-muted">Supply</span>
                    <span className="font-mono font-bold">1,000,000,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-shield-line p-4">
              <div className="text-sm font-extrabold text-shield-ink mb-3">Costs and splits</div>
              {[
                ["Deploy cost", "≈0.03 SOL"],
                ["You receive", `${tier}% of every trade`],
                ["Liquidity", burnLp ? "Burned 🔥" : "Locked forever"],
                ["Pool", "Meteora curve → DAMM v2"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1.5">
                  <span className="text-shield-muted">{k}</span>
                  <span className="font-mono font-bold text-shield-ink">{v}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <StatusBar />
    </main>
  );
}
