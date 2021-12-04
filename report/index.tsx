import ReactDOM from "react-dom";

import { Compressed, decompress } from "compress-json";

import ReportPage from "@report/ReportPage";
import { initDataProvider } from "@report/DataProvider";

declare global {
    interface Window {
        __PREPROCESSED_DATA__: Compressed | undefined;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    window.__PREPROCESSED_DATA__ = env.isProd
        ? window.__PREPROCESSED_DATA__
        : require(/* webpackChunkName: "sample" */ "@assets/report_sample.json");

    if (window.__PREPROCESSED_DATA__ !== undefined) {
        console.log("Input data size", JSON.stringify(window.__PREPROCESSED_DATA__).length);

        const REPORT_DATA = decompress(window.__PREPROCESSED_DATA__);
        initDataProvider(REPORT_DATA);
        ReactDOM.render(<ReportPage />, document.getElementById("app"));
    } else {
        alert("Missing report data");
        window.location.href = "/";
    }
});

console.log(env);
