import TopNav from "@/components/TopNav";
import StatusBar from "@/components/StatusBar";

interface Props {
  params: Promise<{ mint: string }>;
}

export default async function TokenPage({ params }: Props) {
  const { mint } = await params;
  return (
    <main className="min-h-screen flex flex-col bg-shield-bg">
      <TopNav />
      <section className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <p className="text-shield-muted text-sm break-all mb-4 font-mono">{mint}</p>
        <div className="bg-white border border-shield-line rounded-2xl p-8 text-center text-shield-muted">
          K 线 / 交易面板 / 毕业进度 — 首币发射后接入
        </div>
      </section>
      <StatusBar />
    </main>
  );
}
