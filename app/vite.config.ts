import path from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    resolve: {
        alias: {
            "@assets": path.resolve(__dirname, "../assets"),
            "@app": path.resolve(__dirname, "./"),
            "@pipeline": path.resolve(__dirname, "../pipeline"),
        },
    },
    plugins: [wasm()],
});
