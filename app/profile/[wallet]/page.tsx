import TopNav from "@/components/TopNav";
import StatusBar from "@/components/StatusBar";

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
    <main className="min-h-screen flex flex-col bg-shield-bg">
      <TopNav />

      <section className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-1 text-shield-ink">{short}</h1>
        <p className="text-shield-muted text-sm mb-8">个人资料</p>

        <h2 className="text-xl font-extrabold mb-4 text-shield-ink">🪙 我发行的币</h2>
        <div className="bg-white border border-shield-line rounded-2xl p-8 text-center text-shield-muted">
          待接入 — 发币记录写入后这里会按钱包地址归集显示：
          市值 / 毕业状态 / 累计 creator fee
        </div>

        <h2 className="text-xl font-extrabold mb-4 mt-10 text-shield-ink">📊 持仓</h2>
        <div className="bg-white border border-shield-line rounded-2xl p-8 text-center text-shield-muted">
          接入 Helius 余额索引后显示
        </div>
      </section>
      <StatusBar />
    </main>
  );
}
