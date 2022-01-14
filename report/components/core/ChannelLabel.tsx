import "@assets/styles/Labels.less";

import { memo } from "react";

import { Index } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import Hashtag from "@assets/images/icons/hashtag.svg";

interface Props {
    index: Index;
}

const ChannelLabel = ({ index }: Props) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const channel = dp.database.channels[index];

    if (channel === undefined) {
        return <span>invalid channel index {index}</span>;
    }

    return (
        <div className="Label" title={channel.n}>
            {platform === "discord" && <img src={Hashtag} />}
            <span className="Label__name">{channel.n}</span>
        </div>
    );
};

export default memo(ChannelLabel) as typeof ChannelLabel;
