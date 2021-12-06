import { useEffect, useState } from "react";
import prettyBytes from "pretty-bytes";

import Button from "@app/components/Button";

import { ReportResult } from "@pipeline/Types";

import LinkOut from "@assets/images/link-out.svg";
import Download from "@assets/images/download.svg";
import Refresh from "@assets/images/refresh.svg";

interface Props {
    result: ReportResult | null;
}

// trailing s
const ts = (n: number) => (n === 1 ? "" : "s");

const ViewDownloadReport = ({ result }: Props) => {
    const [file, setFile] = useState<{
        blob: Blob | null;
        url: string;
        jsonURL: string;
        filename: string;
    }>({
        blob: null,
        url: "",
        jsonURL: "",
        filename: "",
    });

    useEffect(() => {
        if (result) {
            const date = new Date();
            const htmlBlob = new Blob([result.html], { type: "text/html" });
            const jsonBlob = new Blob([result.json || ""], { type: "application/json" });
            setFile({
                blob: htmlBlob,
                url: URL.createObjectURL(htmlBlob),
                jsonURL: URL.createObjectURL(jsonBlob),
                filename: `${result?.title}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.html`,
            });
        }
    }, [result]);

    return (
        <div className="ViewDownloadReport">
            {result && (
                <div className="ViewDownloadReport__stats">
                    Your report <b>"{result.title}"</b> is ready!
                    <br />
                    It contains <b>{result.counts.messages.toLocaleString()}</b> message{ts(result.counts.messages)}{" "}
                    from <b>{result.counts.authors.toLocaleString()}</b> author{ts(result.counts.authors)} in{" "}
                    <b>{result.counts.channels.toLocaleString()}</b> channel{ts(result.counts.channels)}.
                </div>
            )}
            <div className="ViewDownloadReport__buttons">
                <Button hueColor={[258, 90, 61]} href={file.url} download={file.filename}>
                    <img src={Download} alt="Download" />
                    Download ({prettyBytes(file.blob?.size || 0)})
                </Button>
                <Button hueColor={[244, 90, 61]} href={file.url} target="_blank">
                    <img src={LinkOut} alt="Link out" />
                    View Locally
                </Button>
                <Button hueColor={[105, 70, 50]} href={file.jsonURL} download="report_sample.json">
                    🛠️ Download JSON (dev)
                </Button>
            </div>
            <div className="ViewDownloadReport__notice">
                Remember that we don't store your reports, so you can't share the "View Locally" link. To share the
                report, download it and share the file.
            </div>
            <a href="/" className="ViewDownloadReport__restart">
                <img src={Refresh} alt="Refresh" />
                Generate a new report
            </a>
        </div>
    );
};

export default ViewDownloadReport;
