import "@assets/styles/Card.less";

import { useEffect, useState } from "react";
import { InView } from "react-intersection-observer";

import Spinner from "@assets/images/spinner.svg";
import { BlockData, BlockKey, BlockState } from "@pipeline/blocks/Blocks";
import { dataProvider } from "@report/DataProvider";

interface Props {
    // TODO: enforce correct type
    children: React.ReactNode | ((props: { data: any }) => React.ReactNode);
    blockKey: BlockKey;
    title?: string;
    num: 1 | 2 | 3;
}

const Indicators = {
    loading: "⚙️",
    "no-data": "No data",
    stale: "⌛",
    error: "❌",
    ready: "✅",
};

const Card = (props: Props) => {
    const [id] = useState(Math.floor(Math.random() * 0xffffffff));
    const [content, setContent] = useState<{
        state: BlockState;
        data: any | null;
    }>({
        state: "stale",
        data: null,
    });

    useEffect(() => {
        const updateContent = (state: BlockState, data?: BlockData) => {
            setContent({ state, data: data || content.data });
        };
        dataProvider.on(props.blockKey, updateContent);

        return () => {
            // make sure to deactivate
            dataProvider.toggleBlock(props.blockKey, id, false);
            dataProvider.off(props.blockKey, updateContent);
        };
    }, []);

    const onChange = (inView: boolean) => dataProvider.toggleBlock(props.blockKey, id, inView);

    return (
        <InView onChange={onChange} className={"Card Card--" + props.num}>
            {props.title ? <div className="Card_title">{props.title}</div> : null}
            {props.children}
            <div className={"Card_overlay" + (content.state === "ready" ? " Card_overlay--hidden" : "")}>
                <img src={Spinner} alt="Loading" height={60} />
                {Indicators[content.state]}
            </div>
        </InView>
    );
};

export default Card;
