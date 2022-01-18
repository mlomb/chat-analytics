import "@assets/styles/Labels.less";

import { memo } from "react";

import { Index } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";

import ImageSmooth from "@report/components/core/ImageSmooth";
import DefaultFaviconIcon from "@assets/images/icons/default-favicon.png";
import LinkOutIcon from "@assets/images/icons/link-out-blue.svg";

interface Props {
    index: Index;
}

const DefaultFavicon = <img src={DefaultFaviconIcon} width={16} height={16} />;

const DomainLabel = ({ index }: Props) => {
    const dp = useDataProvider();
    const domain = dp.database.domains[index];

    if (domain === undefined) {
        return <span>invalid domain index {index}</span>;
    }

    // NOTE: we use the icon provided by DuckDuckGo:
    // https://icons.duckduckgo.com/ip3/google.com.ico
    // we could also use the icon provided by Google:
    // https://www.google.com/s2/favicons?domain=google.com

    return (
        <div className="Label Label-domain" title={domain}>
            <a href={`http://${domain}`} target="_blank" className="Label__name">
                <div className="Label__icon">
                    <ImageSmooth src={`https://icons.duckduckgo.com/ip3/${domain}.ico`} children={DefaultFavicon} />
                </div>
                {domain}
                <img className="Label__linkout" src={LinkOutIcon} width={12} height={12} />
            </a>
        </div>
    );
};

export default memo(DomainLabel) as typeof DomainLabel;
