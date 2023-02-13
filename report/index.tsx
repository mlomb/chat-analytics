import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { initBlockStore } from "@report/BlockStore";
import ReportPage from "@report/ReportPage";
import { initWorker } from "@report/WorkerWrapper";

import { plausible } from "@assets/Plausible";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const dataElem = document.getElementById("data")!;
        let dataStr: string = dataElem.textContent || "";
        dataElem.remove();

        if (dataStr === "[[[DATA]]]") {
            // load from public/ folder
            const res = await fetch("report_sample.data");
            if (res.status !== 200) {
                alert("Could not load `report_sample.data` from `/public` for development, make sure to generate one.");
                return;
            }
            dataStr = await res.text();
        }

        if (dataStr.length === 0 || dataStr === "[[[DATA]]]") {
            alert("Missing report data");
            if (env.isProd) window.location.href = "/";
            return;
        }

        initWorker(dataStr);
        initBlockStore();
    } catch (err) {
        // set basic error message
        document.querySelector(".basic")!.textContent = "Error occurred: " + (err as Error).message;
        return;
    }

    createRoot(document.getElementById("app") as HTMLElement).render(
        <StrictMode>
            <ReportPage />
        </StrictMode>
    );
});

console.log(env);

plausible("pageview");
