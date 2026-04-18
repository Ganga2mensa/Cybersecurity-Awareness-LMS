import type { Config } from "tailwindcss";

// Note: Tailwind CSS v4 uses CSS-based configuration (see src/app/globals.css).
// This file is retained for tooling compatibility and documents the content paths.
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
