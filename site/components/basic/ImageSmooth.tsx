import { memo, useState } from "react";

interface Props {
    src: string;
    children: React.ReactNode; // placeholder
};

const ImageSmooth = ({ src, children }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const onLoad = () => setLoaded(true);

    return <>
        {!loaded && children}
        <img
            loading="lazy"
            src={src}
            className="ImageSmooth"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={onLoad}
        />
    </>
};

export default memo(ImageSmooth);