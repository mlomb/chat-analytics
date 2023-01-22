import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";

import { ResultMessage } from "@app/WorkerApp";
import Button from "@app/components/Button";

import { plausible } from "@assets/Plausible";
import Download from "@assets/images/icons/download.svg";
import LinkOut from "@assets/images/icons/link-out.svg";
import Refresh from "@assets/images/icons/refresh.svg";

interface Props {
    result: ResultMessage | null;
}

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
                filename: `${result.title}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.html`,
            });
        }
    }, [result]);

    const onDownload = () => plausible("Download report");
    const onOpenLocally = () => plausible("Open report");

    const Stats = ({ result }: { result: ResultMessage }) => {
        const stats = [
            {
                prefix: "It contains",
                value: result.counts.messages,
                name: "message",
                hue: 61,
                alwaysShow: true,
            },
            {
                prefix: "from",
                value: result.counts.authors,
                name: "author",
                hue: 240,
                alwaysShow: true,
            },
            {
                prefix: "in",
                value: result.counts.channels,
                name: "channel",
                hue: 266,
                alwaysShow: false,
            },
            {
                prefix: "in",
                value: result.counts.guilds,
                name: "guild",
                hue: 0,
                alwaysShow: false,
            },
        ].filter((stat) => stat.alwaysShow || stat.value > 1);

        // trailing s
        const ts = (n: number) => (n === 1 ? "" : "s");

        return (
            <>
                {stats.map((stat, i) => (
                    <span key={i}>
                        {i > 0 ? " " : ""}
                        {stat.prefix}{" "}
                        <b style={{ color: `hsl(${stat.hue}, 100%, 74%)` }}>
                            {stat.value.toLocaleString() + " " + stat.name + ts(stat.value)}
                        </b>
                    </span>
                ))}
                .
            </>
        );
    };

    return (
        <div className="ViewDownloadReport">
            {result && (
                <>
                    Your report <b>"{result.title}"</b> is ready!
                    <br />
                    <Stats result={result} />
                </>
            )}
            <div className="ViewDownloadReport__buttons">
                <Button hueColor={[258, 90, 61]} href={files.htmlURL} download={files.filename} onClick={onDownload}>
                    <img src={Download} alt="Download" height={16} />
                    Download ({prettyBytes(files.htmlBlob?.size || 0)})
                </Button>
                <Button hueColor={[244, 90, 61]} href={files.htmlURL} target="_blank" onClick={onOpenLocally}>
                    <img src={LinkOut} alt="Link out" height={16} />
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
