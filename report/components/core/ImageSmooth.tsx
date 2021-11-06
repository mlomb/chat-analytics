import { useState } from "react";

interface Props {
    src: string;
    children: React.ReactNode; // placeholder
}

// NOTE: store loading status to avoid flickering in some conditions
// false: error loading
// true: loaded correctly
const loadStatus: { [url: string]: "ok" | "error" } = {};

const ImageSmooth = ({ src, children }: Props) => {
    const [status, setStatus] = useState<"ok" | "error" | "loading">(loadStatus[src] || "loading");
    const onLoad = () => {
        loadStatus[src] = "ok";
        setStatus("ok");
    };
    const onError = () => {
        loadStatus[src] = "error";
        setStatus("error");
    };

    return (
        <>
            {status !== "ok" && children}
            {status !== "error" && (
                <img
                    loading="lazy"
                    src={src}
                    className="ImageSmooth"
                    style={{ opacity: status === "ok" ? 1 : 0 }}
                    onLoad={onLoad}
                    onError={onError}
                />
            )}
        </>
    );
};

export default ImageSmooth;
