import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { HomePage } from "@app/HomePage";

import "@assets/Favicon";
import { plausible } from "@assets/Plausible";

createRoot(document.getElementById("app") as HTMLElement).render(
    <StrictMode>
        <HomePage />
    </StrictMode>
);

console.log(import.meta.env);

plausible("pageview");

async function test() {
    // @ts-ignore
    const worker = new Worker(new URL("@app/GlueWorker.ts", import.meta.url), { type: "module" });
    console.log(worker);
}

test();
