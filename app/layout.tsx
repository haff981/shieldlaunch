import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ShieldLaunch — Solana Memecoin Launchpad",
  description: "Launch tokens on Meteora DBC. Creators earn, platform earns. shieldlaunch.life",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
