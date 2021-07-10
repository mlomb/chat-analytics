import "./assets/report.less";
import { h, render } from 'preact';
import { Report } from "../analyzer/Analyzer";

declare var __REPORT_DATA__: Report | undefined;

let root: any;
function init() {
	let ReportPage = require('./components/ReportPage').default;
	root = render(<ReportPage report={__REPORT_DATA__!} />, document.body, root);
}

// HMR
if (module.hot) {
	require('preact/devtools');
	module.hot.accept('./components/ReportPage', () => requestAnimationFrame(init));
}

// @ts-ignore
if(window.__REPORT_DATA__ !== undefined) {
	document.addEventListener('DOMContentLoaded', init);
} else {
    alert("Missing report data");
	window.location.href = '/';
}