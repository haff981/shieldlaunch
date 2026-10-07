import Link from "next/link";

interface Props {
  params: Promise<{ mint: string }>;
}

export default async function TokenPage({ params }: Props) {
  const { mint } = await params;
  return (
    <main className="min-h-screen bg-shield-bg">
      <nav className="px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-shield-neon">
          🛡️ ShieldLaunch
        </Link>
      </nav>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-white/40 text-sm break-all mb-4">{mint}</p>
        <div className="bg-shield-panel rounded-xl p-8 text-center text-white/40">
          K 线 / 交易面板 / 毕业进度 — devnet 联调后接入
        </div>
      </section>
    </main>
  );
}
