import { ReactNode, useState } from "react";

interface Props {
    src: string;
    children: ReactNode; // placeholder
}

// NOTE: store loading status to avoid flickering in some conditions
// false: error loading
// true: loaded correctly
const loadStatus: { [url: string]: "ok" | "error" } = {};

const LazyImage = ({ src, children }: Props) => {
    const [_, ping] = useState<number>(0);
    const onLoad = () => {
        loadStatus[src] = "ok";
        ping(Date.now());
    };
    const onError = () => {
        loadStatus[src] = "error";
        ping(Date.now());
    };

    const status = loadStatus[src];

    return (
        <>
            {status !== "ok" && children}
            {status !== "error" && (
                <img
                    loading="lazy"
                    src={src}
                    className="LazyImage"
                    style={{ opacity: status === "ok" ? 1 : 0 }}
                    onError={status === undefined ? onError : undefined}
                    onLoad={status === undefined ? onLoad : undefined}
                />
            )}
        </>
    );
};

export default LazyImage;
