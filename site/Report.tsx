import "./assets/report.less";
import ReactDOM from 'react-dom';

import { Compressed, decompress } from "compress-json";

import ReportPage from "./components/ReportPage";

// set amcharts theme
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
am4core.useTheme(am4themes_animated);

declare global {
    interface Window {
        __REPORT_DATA__: Compressed | undefined
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.__REPORT_DATA__ === undefined) {
        window.__REPORT_DATA__ = await require(/* webpackChunkName: "sample" */ "./report_sample_data.json");
    }

    if(window.__REPORT_DATA__ !== undefined) {
        const REPORT_DATA = decompress(window.__REPORT_DATA__);
        ReactDOM.render(
            <ReportPage report={REPORT_DATA} />,
            document.getElementById("app")
        );
    } else {
        alert("Missing report data");
        window.location.href = '/';
    }
});
