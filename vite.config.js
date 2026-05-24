import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  },
  server: {
    proxy: {
      "/anikai": {
        target: "https://anikai.to",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/anikai/, ""),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " + "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Referer: "https://anikai.to/",
          Cookie: process.env.VITE_ANIKAI_COOKIE || ""
        }
      },
      "/anikoto": {
        target: "https://anikotoapi.site",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/anikoto/, ""),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " + "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Origin: "https://megaplay.buzz",
          Referer: "https://megaplay.buzz/"
        }
      }
    }
  }
});
