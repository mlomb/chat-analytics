import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { plausible } from "@assets/Plausible";

import ReportPage from "@report/ReportPage";

import { initDataProvider } from "@report/DataProvider";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const dataElem = document.getElementById("data")!;
        let dataStr: string = dataElem.textContent || "";
        dataElem.remove();

        if (dataStr === "[[[DATA]]]") {
            // load from public/ folder
            dataStr = await fetch("report_sample.data").then((res) => res.text());
        }

        if (dataStr.length === 0 || dataStr === "[[[DATA]]]") {
            alert("Missing report data");
            if (env.isProd) window.location.href = "/";
            return;
        }

        initDataProvider(dataStr);
    } catch (err) {
        // set basic error message
        document.querySelector(".basic")!.textContent = "Error ocurred: " + (err as Error).message;
        return;
    }

    createRoot(document.getElementById("app") as HTMLElement).render(
        <StrictMode>
            <ReportPage />
        </StrictMode>
    );
});

console.log(env);

plausible("pageview", {
    url: document.location.pathname === "/demo" ? undefined : "https://chatanalytics.app/report",
});
