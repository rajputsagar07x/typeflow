import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: "0.0.0.0",
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT ?? 5000}`,
        changeOrigin: true,
      },
    },
  },
  preview: { port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" },
});
