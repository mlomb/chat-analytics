import { memo } from "react";

import { Author, Index, Platform } from "@pipeline/Types";
import BaseLabel, { LabelAvatar, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

import discord_avatar_0 from "@assets/images/platforms/discord/avatars/avatar_0.png";
import discord_avatar_1 from "@assets/images/platforms/discord/avatars/avatar_1.png";
import discord_avatar_2 from "@assets/images/platforms/discord/avatars/avatar_2.png";
import discord_avatar_3 from "@assets/images/platforms/discord/avatars/avatar_3.png";
import discord_avatar_4 from "@assets/images/platforms/discord/avatars/avatar_4.png";
import messenger_avatar from "@assets/images/platforms/messenger/default_avatar.png";
import wpp_avatar from "@assets/images/platforms/whatsapp/default_avatar.png";

const DiscordDefaultAvatars = [
    discord_avatar_0,
    discord_avatar_1,
    discord_avatar_2,
    discord_avatar_3,
    discord_avatar_4,
];

const TelegramBubbleColors = [
    ["ff885e", "ff516a"],
    ["ffcd6a", "ffa85c"],
    ["82b1ff", "665fff"],
    ["a0de7e", "54cb68"],
    ["53edd6", "28c9b7"],
    ["72d5fd", "2a9ef1"],
    ["e0a2f3", "d669ed"],
];

const RawImg = (src: any) => (
    <img
        src={src}
        style={{
            width: "100%",
            height: "100%",
        }}
    />
);

const AuthorAvatar: {
    [platform in Platform]: (author: Author, index: Index) => LabelAvatar | undefined;
} = {
    discord: (author) => ({
        // https://cdn.discordapp.com/avatars/{user_id}/{user_avatar}.png
        url: author.da ?? `https://cdn.discordapp.com/avatars/${author.da}.png?size=32`,
        placeholder: RawImg(DiscordDefaultAvatars[(author.d || 0) % 5]),
    }),
    whatsapp: () => ({
        placeholder: RawImg(wpp_avatar),
    }),
    messenger: () => ({
        placeholder: RawImg(messenger_avatar),
    }),
    telegram: (author, index) => {
        // TODO: two letters
        let letter: string = "";
        // iterate UTF-8 codepoints
        for (const symbol of author.n) {
            letter = symbol;
            break;
        }

        const colors = TelegramBubbleColors[(1779033703 ^ index) % TelegramBubbleColors.length];
        const placeholder = (
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

        return { placeholder };
    },
};

const _AuthorLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const platform = dp.database.config.platform;
    const author = dp.database.authors[index];

    const avatar = AuthorAvatar[platform](author, index);
    const name = (
        <>
            {author.n}
            {author.d !== undefined && (
                <span className="Label__discriminator">#{`${demo ? 0 : author.d}`.padStart(4, "0")}</span>
            )}
        </>
    );

    return <BaseLabel title={author.n} name={name} avatar={avatar} />;
};

export const AuthorLabel = memo(_AuthorLabel) as typeof _AuthorLabel;
