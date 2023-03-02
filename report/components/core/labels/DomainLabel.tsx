import { memo } from "react";

import { getDatabase } from "@report/WorkerWrapper";
import { LazyImage } from "@report/components/core/LazyImage";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

import DefaultFaviconIcon from "@assets/images/icons/default-favicon.png";
import LinkOutIcon from "@assets/images/icons/link-out-blue.svg";

const DefaultFavicon = <img src={DefaultFaviconIcon} width={16} height={16} />;

const _DomainLabel = ({ index }: LabelProps) => {
    const db = getDatabase();
    const domain = db.domains[index];

    // NOTE: we use the icon provided by DuckDuckGo:
    // https://icons.duckduckgo.com/ip3/google.com.ico
    // we could also use the icon provided by Google:
    // https://www.google.com/s2/favicons?domain=google.com
    // but you know... privacy

    const domainIcon = (
        <div style={{ width: 16, height: 16 }}>
            <LazyImage src={`https://icons.duckduckgo.com/ip3/${domain}.ico`} placeholder={DefaultFavicon} />
        </div>
    );
    const linkoutIcon = <img src={LinkOutIcon} width={12} height={12} />;

    return (
        <a className="Label" href={`http://${domain}`} target="_blank" rel="noopener noreferrer">
            <BaseLabel title={domain} leftIcon={domainIcon} name={domain} rightIcon={linkoutIcon} />
        </a>
    );
};

export const DomainLabel = memo(_DomainLabel) as typeof _DomainLabel;
