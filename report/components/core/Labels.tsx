import "@assets/styles/Labels.less";

import { memo } from "react";

import { Index } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import ImageSmooth from "@report/components/core/ImageSmooth";

import DefaultFaviconIcon from "@assets/images/icons/default-favicon.png";
import LinkOutIcon from "@assets/images/icons/link-out-blue.svg";
import Hashtag from "@assets/images/icons/hashtag.svg";
import wpp_avatar from "@assets/images/platforms/whatsapp/default_avatar.png";
import avatar_0 from "@assets/images/platforms/discord/avatars/avatar_0.png";
import avatar_1 from "@assets/images/platforms/discord/avatars/avatar_1.png";
import avatar_2 from "@assets/images/platforms/discord/avatars/avatar_2.png";
import avatar_3 from "@assets/images/platforms/discord/avatars/avatar_3.png";
import avatar_4 from "@assets/images/platforms/discord/avatars/avatar_4.png";
const DiscordDefaultAvatars = [avatar_0, avatar_1, avatar_2, avatar_3, avatar_4];

const TelegramBubbleColors = [
    ["ff885e", "ff516a"],
    ["ffcd6a", "ffa85c"],
    ["82b1ff", "665fff"],
    ["a0de7e", "54cb68"],
    ["53edd6", "28c9b7"],
    ["72d5fd", "2a9ef1"],
    ["e0a2f3", "d669ed"],
];

// common props for all labels
interface LabelProps {
    index: Index;
}

const _AuthorLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const author = dp.database.authors[index];

    if (author === undefined) {
        return <span>invalid author index {index}</span>;
    }

    let avatarUrl: string | undefined;
    let placeholder: JSX.Element | null;
    if (platform === "discord") {
        placeholder = (
            <img
                src={DiscordDefaultAvatars[(author.d || 0) % 5]}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        );
        if (author.da) {
            // https://cdn.discordapp.com/avatars/user_id/user_avatar.png
            avatarUrl = `https://cdn.discordapp.com/avatars/${author.da}.png?size=32`;
        }
    } else if (platform === "whatsapp") {
        placeholder = (
            <img
                src={wpp_avatar}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        );
    } else if (platform === "telegram") {
        // TODO: two letters
        let letter: string = "";
        // iterate UTF-8 codepoints
        for (const symbol of author.n) {
            letter = symbol;
            break;
        }
        const colors = TelegramBubbleColors[(1779033703 ^ index) % TelegramBubbleColors.length];
        placeholder = (
            <div
                style={{
                    background: `linear-gradient(#${colors[0]}, #${colors[1]})`,
                    textAlign: "center",
                    lineHeight: "20px",
                    color: "#fff",
                    fontSize: 10,
                }}
            >
                {letter}
            </div>
        );
    } else {
        placeholder = null;
    }

    const avatar = avatarUrl ? <ImageSmooth src={avatarUrl} children={placeholder} /> : placeholder;

    return (
        <div className="Label" title={author.n}>
            <div className="Label__avatar">{avatar}</div>
            <span className="Label__name">{author.n}</span>
            {author.d !== undefined && <span className="Label__discriminator">#{`${author.d}`.padStart(4, "0")}</span>}
        </div>
    );
};

const _ChannelLabel = ({ index }: LabelProps) => {
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

const _EmojiLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const emoji = dp.database.emojis[index];

    if (emoji === undefined) {
        return <span>invalid emoji index {index}</span>;
    }

    let image: JSX.Element | null = null;
    if (emoji.id) {
        image = (
            <img
                src={`https://cdn.discordapp.com/emojis/${emoji.id}.png?size=32`}
                height={16}
                style={{ marginRight: 5 }}
            />
        );
    }

    return (
        <div className="Label" title={emoji.n}>
            {image}
            <div className="Label__name">{emoji.n}</div>
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
                    <ImageSmooth src={`https://icons.duckduckgo.com/ip3/${domain}.ico`} children={DefaultFavicon} />
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
export const AuthorLabel = memo(_AuthorLabel) as typeof _AuthorLabel;
export const ChannelLabel = memo(_ChannelLabel) as typeof _ChannelLabel;
export const WordLabel = memo(_WordLabel) as typeof _WordLabel;
export const EmojiLabel = memo(_EmojiLabel) as typeof _EmojiLabel;
export const DomainLabel = memo(_DomainLabel) as typeof _DomainLabel;
export const MentionLabel = memo(_MentionLabel) as typeof _MentionLabel;
