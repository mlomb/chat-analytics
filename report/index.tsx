import { StrictMode } from "react";
import ReactDOM from "react-dom";

import ReportPage from "@report/ReportPage";

import { initDataProvider } from "@report/DataProvider";

document.addEventListener("DOMContentLoaded", async () => {
    // set basic loading message
    document.querySelector(".basic")!.textContent = "Loading, please wait...";

    try {
        const dataElem = document.getElementById("data")!;
        let dataStr: string = dataElem.textContent || "";
        dataElem.remove();

        if (dataStr === "[[[DATA]]]") {
            try {
                // load from public/ folder
                dataStr = await fetch("report_sample.data").then((res) => res.text());
            } catch (err) {}
        }

        if (dataStr.length === 0 || dataStr === "[[[DATA]]]") {
            alert("Missing report data");
            window.location.href = "/";
        }

        initDataProvider(dataStr);
    } catch (err) {
        // set basic error message
        document.querySelector(".basic")!.textContent = "Error ocurred: " + (err as Error).message;
        return;
    }

    ReactDOM.render(
        <StrictMode>
            <ReportPage />
        </StrictMode>,
        document.getElementById("app")
    );
});

console.log(env);
