import { memo, Suspense, useState } from "react";

interface Props {
    src: string;
    // placeholder
    children: React.ReactNode;
};

const ImageSmooth = ({ src, children }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const onLoad = () => setLoaded(true);

    console.log(loaded);

    return <>
        {!loaded && children}
        <img
            loading="lazy"
            src={src}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: loaded ? 1 : 0,
            }}
            onLoad={onLoad}
        />
    </>
};

export default memo(ImageSmooth);