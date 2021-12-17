import ReactDOM from "react-dom";

import ReportPage from "@report/ReportPage";
import { initDataProvider } from "@report/DataProvider";

document.addEventListener("DOMContentLoaded", async () => {
    /*if (window.__PREPROCESSED_DATA__ !== undefined) {
        initDataProvider(REPORT_DATA);
        ReactDOM.render(<ReportPage />, document.getElementById("app"));
    } else {
        alert("Missing report data");
        window.location.href = "/";
    }*/
});

console.log(env);
