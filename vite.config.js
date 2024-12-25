import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copyFileSync } from "fs";

// Copy _redirects to dist during build
const copyRedirects = () => {
  return {
    name: "copy-redirects",
    closeBundle() {
      copyFileSync("public/_redirects", "dist/_redirects");
    },
  };
};

export default defineConfig({
  plugins: [react(), copyRedirects()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
