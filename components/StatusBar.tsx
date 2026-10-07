"use client";

export default function StatusBar() {
  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-white border-t border-shield-line text-xs text-shield-muted shrink-0 overflow-x-auto whitespace-nowrap">
      <span className="font-bold text-shield-ink">🛡️ shieldlaunch</span>
      <span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
        online
      </span>
      <span>
        SOL <span className="font-mono">$118.43</span>
      </span>
      <span className="hidden sm:inline">Meteora DBC · DAMM v2</span>
      <div className="flex-1" />
      <span className="hidden md:inline">© 2026 ShieldLaunch · Solana</span>
      <span className="text-green-600 font-bold">● Healthy</span>
    </div>
  );
}
