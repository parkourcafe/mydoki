import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce7ff",
          500: "#3b5bdb",
          600: "#2f49b8",
          700: "#263b95",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
