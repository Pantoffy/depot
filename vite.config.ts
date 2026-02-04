import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],

  //bypass cors policy using vite proxy
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7174",
        changeOrigin: true,
        secure: false, // Cho phép self-signed SSL certificate
      },
    },
  },
});
