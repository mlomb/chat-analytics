import "@assets/report.less";
import ReactDOM from "react-dom";

import { Compressed, decompress } from "compress-json";

import ReportPage from "@report/ReportPage";
import { initDataProvider } from "@report/DataProvider";
import { initDataDispatcher } from "@report/DataDispatcher";

declare global {
    interface Window {
        __REPORT_DATA__: Compressed | undefined;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    window.__REPORT_DATA__ = env.isProd
        ? window.__REPORT_DATA__
        : require(/* webpackChunkName: "sample" */ "./report_sample_data.json");

    if (window.__REPORT_DATA__ !== undefined) {
        const REPORT_DATA = decompress(window.__REPORT_DATA__);
        initDataProvider(REPORT_DATA);
        initDataDispatcher(REPORT_DATA);
        ReactDOM.render(<ReportPage />, document.getElementById("app"));
    } else {
        alert("Missing report data");
        window.location.href = "/";
    }
});
