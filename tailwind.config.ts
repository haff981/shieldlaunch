import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        shield: {
          bg: "#edf0f7", // 浅蓝灰底（gomo 同款）
          panel: "#ffffff", // 白卡片
          primary: "#2563eb", // 亮蓝主色
          primaryDark: "#1d4ed8",
          ink: "#0f172a", // 主文字
          muted: "#64748b", // 次文字
          line: "#e2e8f0", // 边框
        },
      },
    },
  },
  plugins: [],
};

export default config;
