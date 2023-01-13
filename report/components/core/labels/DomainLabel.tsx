import { memo } from "react";

import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";
import { LazyImage } from "@report/components/core/LazyImage";
import { useDataProvider } from "@report/DataProvider";

import DefaultFaviconIcon from "@assets/images/icons/default-favicon.png";

const DefaultFavicon = <img src={DefaultFaviconIcon} width={16} height={16} />;

const _DomainLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const domain = dp.database.domains[index];

    // NOTE: we use the icon provided by DuckDuckGo:
    // https://icons.duckduckgo.com/ip3/google.com.ico
    // we could also use the icon provided by Google:
    // https://www.google.com/s2/favicons?domain=google.com
    // but you know... privacy

    return (
        <BaseLabel
            title={domain}
            icon={
                <LazyImage
                    src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
                    placeholder={DefaultFavicon}
                    height={16}
                />
            }
            name={domain}
            link={`http://${domain}`}
        />
    );
};

export const DomainLabel = memo(_DomainLabel) as typeof _DomainLabel;
