"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";

const NAV = [
  { href: "/", label: "交易" },
  { href: "/launch", label: "发币" },
];

export default function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur border-b border-shield-line shrink-0 sticky top-0 z-10">
      <Link href="/" className="text-xl font-extrabold text-shield-ink shrink-0 mr-2">
        🛡️ <span className="text-shield-primary">ShieldLaunch</span>
      </Link>
      {NAV.map((n) => {
        const active =
          n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              active
                ? "bg-shield-ink text-white"
                : "text-shield-muted hover:text-shield-ink"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
      <div className="flex-1 max-w-md hidden md:block">
        <input
          placeholder="搜索代币 / mint 地址…"
          className="w-full bg-shield-bg border border-shield-line rounded-full px-4 py-2 text-sm outline-none focus:border-shield-primary placeholder:text-shield-muted/70"
        />
      </div>
      <div className="flex-1" />
      <Link
        href="/launch"
        className="text-sm font-bold bg-shield-primary text-white px-4 py-2 rounded-full hover:bg-shield-primaryDark shrink-0"
      >
        🚀 发币
      </Link>
      <WalletButton />
    </nav>
  );
}
