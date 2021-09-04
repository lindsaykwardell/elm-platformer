import { defineConfig } from "vite";
import elmPlugin from "vite-plugin-elm";

export default defineConfig({
  plugins: [elmPlugin()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3030",
        changeOrigin: true,
        pathRewrite: { "^/socket.io": "" },
      },
    },
  },
});
