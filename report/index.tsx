import { StrictMode } from "react";
import ReactDOM from "react-dom";

// import ReportPage from "@report/ReportPage";

import { initDataProvider } from "@report/DataProvider";

document.addEventListener("DOMContentLoaded", async () => {
    const dataElem = document.getElementById("data")!;
    let dataStr: string = dataElem.textContent || "";
    dataElem.remove();

    if (env.isDev) {
        //  load from public/ folder
        dataStr = await fetch("report_sample.data").then((res) => res.text());
    }

    if (dataStr.length === 0 || dataStr === "[[[DATA]]]") {
        alert("Missing report data");
        window.location.href = "/";
    }

    initDataProvider(dataStr);
    ReactDOM.render(
        <StrictMode>
            {/*<ReportPage />*/}
            <div>PAGE</div>
        </StrictMode>,
        document.getElementById("app")
    );
});

console.log(env);
