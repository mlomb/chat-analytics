import path from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    resolve: {
        alias: {
            "@assets": path.resolve(__dirname, "../assets"),
            "@pipeline": path.resolve(__dirname, "../pipeline"),
            "@report": path.resolve(__dirname, "./"),
        },
    },
    plugins: [wasm()],
    define: {
        env: {
            isProd: JSON.stringify(false),
            isDev: JSON.stringify(true),
            isSelfHosted: JSON.stringify(false),
        },
    },
});
