import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { useDataProvider } from "@report/DataProvider";

import Logo from "@assets/images/logo.svg";
import Spinner from "@assets/images/spinner.svg";

interface Props {
    loading: boolean;
}

const LoadingOverlay = (props: Props) => {
    const dp = useDataProvider();
    const [progress, setProgress] = useState<[number, number] | undefined>(undefined);

    useEffect(() => {
        const onProgress = (progress: [number, number]) => setProgress(progress);
        dp.on("decompress-progress", onProgress);
        return () => void dp.off("decompress-progress", onProgress);
    }, [dp]);

    return (
        <div className={`LoadingOverlay ${props.loading ? "" : "LoadingOverlay--hidden"}`}>
            <div className="LoadingOverlay__logo">
                <img src={Logo} alt="chatstbdtbd.app logo" />
            </div>
            <div className="LoadingOverlay__spinner">
                <img src={Spinner} alt="spinner" />
                <div>Decompressing data...</div>
            </div>
            <div className="LoadingOverlay__progress">
                {progress && (
                    <>
                        {prettyBytes(progress[0])}/{prettyBytes(progress[1])}
                    </>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;
