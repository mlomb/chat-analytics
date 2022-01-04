import { useEffect, useState } from "react";
import { InView } from "react-intersection-observer";

import { useDataProvider } from "@report/DataProvider";
import { BlockInfo, BlockKey } from "@pipeline/aggregate/Blocks";

interface Props<K extends BlockKey> {
    blockKey: K;
    children: (props: { info: BlockInfo<K> }) => JSX.Element;
}

const Block = <K extends BlockKey>(props: Props<K>) => {
    const dataProvider = useDataProvider();
    const [id] = useState(Math.floor(Math.random() * 0xffffffff));
    const [info, setInfo] = useState<BlockInfo<K>>({
        state: "stale",
        data: null,
    });

    useEffect(() => {
        const updateInfo = (newInfo: BlockInfo<K>) => {
            setInfo((prev) => ({
                ...newInfo,
                data: newInfo.data || prev.data,
            }));
        };
        dataProvider.on(props.blockKey, updateInfo);

        return () => {
            // make sure to deactivate
            dataProvider.toggleBlock(props.blockKey, id, false);
            dataProvider.off(props.blockKey, updateInfo);
        };
    }, []);

    const onChange = (inView: boolean) => dataProvider.toggleBlock(props.blockKey, id, inView);

    return <InView onChange={onChange}>{props.children({ info })}</InView>;
};

export default Block;
