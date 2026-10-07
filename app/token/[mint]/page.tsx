import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

interface Props {
  params: Promise<{ mint: string }>;
}

export default async function TokenPage({ params }: Props) {
  const { mint } = await params;
  return (
    <main className="min-h-screen bg-shield-bg">
      <nav className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-shield-neon">
          🛡️ ShieldLaunch
        </Link>
        <div className="flex-1" />
        <Link
          href="/launch"
          className="text-sm font-bold bg-shield-neon text-black px-4 py-2 rounded-lg hover:opacity-90"
        >
          ＋ 发币
        </Link>
        <WalletButton />
      </nav>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-white/40 text-sm break-all mb-4 font-mono">{mint}</p>
        <div className="bg-shield-panel border border-white/10 rounded-xl p-8 text-center text-white/40">
          K 线 / 交易面板 / 毕业进度 — 首币发射后接入
        </div>
      </section>
    </main>
  );
}
