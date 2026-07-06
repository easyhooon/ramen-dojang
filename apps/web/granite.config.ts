import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ramen-dojang",
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite --host 0.0.0.0",
      build: "vite build",
    },
  },
  permissions: [],
  brand: {
    displayName: "라멘 도장깨기",
    icon: "https://static.toss.im/appsintoss/73/10550764-5ac1-44e2-9ff3-ad78d8d2e71a.png",
    primaryColor: "#b45309",
    bridgeColorMode: "basic",
  },
  webViewProps: {
    type: "partner",
  },
});
