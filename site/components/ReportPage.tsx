import { Report } from "../../analyzer/Analyzer";

import { h, Fragment } from 'preact';
import Header from "./Header";


interface Props {
    report: Report
};

const ReportPage = ({ report }: Props) => {
    console.log("report", report);
    return <>
        <Header></Header>
        <h1>Holaaaaasdasd</h1>
    </>;
};

export default ReportPage;