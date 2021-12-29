import { useEffect, useState } from "react";
import prettyBytes from "pretty-bytes";

import { ResultMessage } from "@app/WorkerApp";
import Button from "@app/components/Button";

import LinkOut from "@assets/images/icons/link-out.svg";
import Download from "@assets/images/icons/download.svg";
import Refresh from "@assets/images/icons/refresh.svg";

interface Props {
    result: ResultMessage | null;
}

// trailing s
const ts = (n: number) => (n === 1 ? "" : "s");

const ViewDownloadReport = ({ result }: Props) => {
    const [files, setFiles] = useState<{
        dataBlob: Blob | null;
        dataURL: string;
        htmlBlob: Blob | null;
        htmlURL: string;
        filename: string;
    }>({
        dataBlob: null,
        dataURL: "",
        htmlBlob: null,
        htmlURL: "",
        filename: "",
    });

    useEffect(() => {
        if (result) {
            const date = new Date();
            const dataBlob = new Blob([result.data || ""], { type: "text/plain" });
            const htmlBlob = new Blob([result.html], { type: "text/html" });
            setFiles({
                dataBlob,
                dataURL: URL.createObjectURL(dataBlob),
                htmlBlob,
                htmlURL: URL.createObjectURL(htmlBlob),
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
                <Button hueColor={[258, 90, 61]} href={files.htmlURL} download={files.filename}>
                    <img src={Download} alt="Download" />
                    Download ({prettyBytes(files.htmlBlob?.size || 0)})
                </Button>
                <Button hueColor={[244, 90, 61]} href={files.htmlURL} target="_blank">
                    <img src={LinkOut} alt="Link out" />
                    View Locally
                </Button>
                {env.isDev && (
                    <Button hueColor={[115, 70, 50]} href={files.dataURL} download="report_sample.data">
                        🛠️ Download DATA (dev, {prettyBytes(files.dataBlob?.size || 0)})
                    </Button>
                )}
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
