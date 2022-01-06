import "@assets/styles/Labels.less";

import { memo } from "react";

import { ID } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import ImageSmooth from "@report/components/core/ImageSmooth";

interface Props {
    id: ID;
}

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

import wpp_avatar from "@assets/images/platforms/whatsapp/default_avatar.png";

const AuthorLabel = ({ id }: Props) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const author = dp.database.authors[id];

    if (author === undefined) {
        return <span>invalid author id {id}</span>;
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
        const colors = TelegramBubbleColors[(1779033703 ^ id) % TelegramBubbleColors.length];
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
            {author.d !== undefined && <span className="Label__discriminator">#{author.d}</span>}
        </div>
    );
};

export default memo(AuthorLabel) as typeof AuthorLabel;
