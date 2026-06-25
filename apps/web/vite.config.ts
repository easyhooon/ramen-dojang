import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ramen-dojang/api-client": fileURLToPath(new URL("../../packages/api-client/src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
