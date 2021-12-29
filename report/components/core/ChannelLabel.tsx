import "@assets/styles/Labels.less";

import { memo } from "react";

import { ID } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import Hashtag from "@assets/images/hashtag.svg";

interface Props {
    id: ID;
}

const ChannelLabel = ({ id }: Props) => {
    const dp = useDataProvider();
    const platform = dp.reportData.config.platform;
    const channel = dp.reportData.channels[id];

    if (channel === undefined) {
        return <span>invalid channel id {id}</span>;
    }

    return (
        <div className="Label" title={channel.n}>
            {platform === "discord" && <img src={Hashtag} />}
            <span className="Label__name">{channel.n}</span>
        </div>
    );
};

export default memo(ChannelLabel) as typeof ChannelLabel;
