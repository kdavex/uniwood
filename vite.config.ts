import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import { resolve } from "node:path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    mode: "development",
    root: "client",
    appType: "spa",
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "client/index.html"),
        },
        outDir: resolve(__dirname, "build"),
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      sourcemap: "inline",
    },

    server: {
      host: "127.0.0.1",
      port: 3000,
      https: {
        key: fs.readFileSync(
          resolve(__dirname, "./client/private/127.0.0.1.key"),
        ),
        cert: fs.readFileSync(
          resolve(__dirname, "./client/private/127.0.0.1.crt"),
        ),
      },
      watch: {
        include: ["client"],
        ignored: ["node_modules", "server"],
      },
    },
    define: {
      "process.env.CLIENT_HOST": JSON.stringify(env.CLIENT_HOST),
      "process.env.CLIENT_PORT": JSON.stringify(env.CLIENT_PORT),
      "process.env.BASE_SERVER_URL": JSON.stringify(env.BASE_SERVER_URL),
      "process.env.SERVER_PUBLIC": JSON.stringify(env.SERVER_PUBLIC),
      "process.env.WS_SERVER_URL": JSON.stringify(env.WS_SERVER_URL),
    },
  };
});
