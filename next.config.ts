import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Le glue-code WASM de Piper (TTS) référence `fs`/`path` (Node) dans des
    // branches gardées par ENVIRONMENT_IS_NODE, jamais exécutées dans le
    // navigateur. On les neutralise pour le bundle client.
    resolveAlias: {
      fs: { browser: "./lib/empty.ts" },
      path: { browser: "./lib/empty.ts" },
    },
  },
};

export default nextConfig;
