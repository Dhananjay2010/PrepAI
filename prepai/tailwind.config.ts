import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2230",
        paper: "#F6F5F1",
        "paper-raised": "#FFFFFF",
        slate: "#6B7280",
        focus: "#4C5FD5",
        highlight: "#FFD166",
        mint: "#2FAE85",
        coral: "#E8604C",
      },
      fontFamily: {
        display: ["var(--font-fraunces)"],
        body: ["var(--font-inter)"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
};
export default config;
