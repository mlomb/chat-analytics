import "./assets/report.less";
import { Report } from "../analyzer/Analyzer";

import { h, Fragment, render } from 'preact';

interface Props {
    report: Report
};

const ReportPage = ({ report }: Props) => {
    console.log("report", report);
    return <h1>Hola {report.db.channels.length}</h1>;
};

declare var __REPORT_DATA__: Report | undefined;

if(__REPORT_DATA__ !== undefined) {
    document.addEventListener('DOMContentLoaded', () => {
        render(<ReportPage report={__REPORT_DATA__!} />, document.body);
    });
} else {
    alert("Missing report data");
}