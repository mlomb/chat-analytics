import "@assets/styles/Labels.less";

import { memo, ReactElement } from "react";

import { Index } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import LazyImage from "@report/components/core/LazyImage";

import DefaultFaviconIcon from "@assets/images/icons/default-favicon.png";
import LinkOutIcon from "@assets/images/icons/link-out-blue.svg";
import Hashtag from "@assets/images/icons/hashtag.svg";
import { LabelProps } from "./labels/BaseLabel";

// NOTE: this file is a bit messy, should be refactored
// there is code that can be easily reused

const _ChannelLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const channel = dp.database.channels[index];

    if (channel === undefined) {
        return <span>invalid channel index {index}</span>;
    }

    let guild: ReactElement | undefined = undefined;
    if (dp.database.guilds.length >= 2) {
        guild = <>{dp.database.guilds[channel.guildIndex].name}</>;
    }

    return (
        <div className="Label" title={channel.name}>
            {guild}
            {platform === "discord" && <img src={Hashtag} height={16} />}
            <span className="Label__name">{channel.name}</span>
        </div>
    );
};

const _WordLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const word = dp.database.words[index];

    if (word === undefined) {
        return <span>invalid word index {index}</span>;
    }

    return (
        <div className="Label" title={word}>
            <div className="Label__name">{word}</div>
        </div>
    );
};

const _EmojiLabel = ({ index, hideNameIfPossible }: LabelProps & { hideNameIfPossible?: boolean }) => {
    const dp = useDataProvider();
    const emoji = dp.database.emojis[index];

    if (emoji === undefined) {
        return <span>invalid emoji index {index}</span>;
    }

    let image: JSX.Element | null = null;
    if (emoji.id) {
        image = <img src={`https://cdn.discordapp.com/emojis/${emoji.id}.png?size=32`} height={16} />;
    }

    const showName = emoji.n !== emoji.c && (!hideNameIfPossible || (emoji.c === undefined && image === null));

    return (
        <div className="Label" title={emoji.n}>
            <span style={{ marginRight: showName ? 5 : 0, display: "inline-flex" }}>
                {image ? image : <span style={{ color: "#b9b9b9" }}>{emoji.c}</span>}
            </span>
            {showName ? <div className="Label__name">{emoji.c ? emoji.n : `:${emoji.n}:`}</div> : null}
        </div>
    );
};

const DefaultFavicon = <img src={DefaultFaviconIcon} width={16} height={16} />;

const _DomainLabel = ({ index }: LabelProps) => {
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
                    <LazyImage src={`https://icons.duckduckgo.com/ip3/${domain}.ico`} children={DefaultFavicon} />
                </div>
                {domain}
                <img className="Label__linkout" src={LinkOutIcon} width={12} height={12} />
            </a>
        </div>
    );
};

const _MentionLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const mention = dp.database.mentions[index];

    if (mention === undefined) {
        return <span>invalid mention index {index}</span>;
    }

    return (
        <div className="Label" title={mention}>
            <div className="Label__name">
                <span style={{ color: "#eded3d" }}>@</span>
                {mention}
            </div>
        </div>
    );
};

// memoize labels
export const ChannelLabel = memo(_ChannelLabel) as typeof _ChannelLabel;
export const WordLabel = memo(_WordLabel) as typeof _WordLabel;
export const EmojiLabel = memo(_EmojiLabel) as typeof _EmojiLabel;
export const DomainLabel = memo(_DomainLabel) as typeof _DomainLabel;
export const MentionLabel = memo(_MentionLabel) as typeof _MentionLabel;
