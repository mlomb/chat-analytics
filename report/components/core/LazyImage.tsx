import { ReactNode, useState } from "react";

interface Props {
    src?: string;
    placeholder: ReactNode;
}

// NOTE: store loading status to avoid flickering in some conditions
// NOTE: it assumes that "Disable cache" is not enabled (no problem if devtools are closed)

// ok: loaded correctly, image in cache
// error: failed to load, remove img
// undefined: loading, keep the img with opacity 0 so onLoad and onError fire
const loadStatus: { [url: string]: "ok" | "error" | undefined } = {};

export const LazyImage = ({ src, placeholder }: Props) => {
    // convenient to allow src to be undefined
    if (src === undefined) return <>{placeholder}</>;

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
            {status !== "ok" && placeholder}
            {status !== "error" && (
                <img
                    className="LazyImage"
                    style={{ opacity: status === "ok" ? undefined : 0 }}
                    loading="lazy"
                    src={src}
                    onError={status === undefined ? onError : undefined}
                    onLoad={status === undefined ? onLoad : undefined}
                />
            )}
        </>
    );
};
