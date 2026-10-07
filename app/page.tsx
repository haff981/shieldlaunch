import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-shield-bg">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="text-2xl font-bold text-shield-neon">🛡️ ShieldLaunch</div>
        <div className="flex items-center gap-4">
          <Link href="/launch" className="text-sm text-white/70 hover:text-white">
            发币
          </Link>
          <WalletMultiButton />
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">
          在 Solana 上<span className="text-shield-neon">发射</span>你的 Meme
        </h1>
        <p className="text-white/60 text-lg mb-10">
          Meteora 动态联合曲线 · 毕业自动迁移 DAMM v2 · 流动性永久锁定
          <br />
          发币人分成可自选，平台手续费自动归集
        </p>
        <Link
          href="/launch"
          className="inline-block bg-shield-neon text-black font-bold px-8 py-4 rounded-xl text-lg hover:opacity-90"
        >
          立即发币 →
        </Link>
        <p className="mt-6 text-xs text-white/30">
          Meteora DBC · 主网模式 · 发币人分成 0–9% 自选
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-xl font-bold mb-4 text-white/80">🔥 正在发射</h2>
        <div className="bg-shield-panel rounded-xl p-8 text-center text-white/40">
          config 建好、首币发射后这里会实时列出
        </div>
      </section>
    </main>
  );
}
