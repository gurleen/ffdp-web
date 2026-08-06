import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const serverPort = process.env.SERVER_PORT ?? 3001;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/rpc": `http://localhost:${serverPort}`,
    },
  },
});
