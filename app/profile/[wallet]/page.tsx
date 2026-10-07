import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface Props {
  params: Promise<{ wallet: string }>;
}

/**
 * 个人资料页：/profile/<钱包地址>
 * - 显示该地址发行过的所有代币（gomo 没有这栏，这是 ShieldLaunch 的差异化）
 * - 数据来源：Supabase token_registry（发币时写入 mint → creator 映射）
 *   后续接 Helius webhook 做链上实时索引
 */
export default async function ProfilePage({ params }: Props) {
  const { wallet } = await params;
  const short =
    wallet.length > 12 ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : wallet;

  return (
    <main className="min-h-screen bg-shield-bg">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-shield-neon">
          🛡️ ShieldLaunch
        </Link>
        <WalletMultiButton />
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-1">{short}</h1>
        <p className="text-white/40 text-sm mb-8">个人资料</p>

        <h2 className="text-xl font-bold mb-4">🪙 我发行的币</h2>
        <div className="bg-shield-panel rounded-xl p-8 text-center text-white/40">
          devnet 联调中 — 发币记录写入后这里会按钱包地址归集显示：
          市值 / 毕业状态 / 累计 creator fee
        </div>

        <h2 className="text-xl font-bold mb-4 mt-10">📊 持仓</h2>
        <div className="bg-shield-panel rounded-xl p-8 text-center text-white/40">
          接入 Helius 余额索引后显示
        </div>
      </section>
    </main>
  );
}
