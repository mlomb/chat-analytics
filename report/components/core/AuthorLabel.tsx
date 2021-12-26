import "@assets/styles/Labels.less";

import { memo } from "react";

import { ID } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";
import ImageSmooth from "@report/components/core/ImageSmooth";

interface Props {
    id: ID;
}

import avatar_0 from "@assets/images/discord_avatars/avatar_0.png";
import avatar_1 from "@assets/images/discord_avatars/avatar_1.png";
import avatar_2 from "@assets/images/discord_avatars/avatar_2.png";
import avatar_3 from "@assets/images/discord_avatars/avatar_3.png";
import avatar_4 from "@assets/images/discord_avatars/avatar_4.png";
const DiscordDefaultAvatars = [avatar_0, avatar_1, avatar_2, avatar_3, avatar_4];

const AuthorLabel = ({ id }: Props) => {
    const dp = useDataProvider();
    const platform = dp.reportData.config.platform;
    const author = dp.reportData.authors[id];

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
    } else if (platform === "telegram") {
        placeholder = <div>A</div>; // TODO: telegram avatars
    } else {
        placeholder = null;
    }

    const avatar = avatarUrl ? <ImageSmooth src={avatarUrl} children={placeholder} /> : placeholder;

    return (
        <div className="Label" title={author.n}>
            <div className="Label__avatar">{avatar}</div>
            <span className="Label__name">{author.n}</span>
            {author.d && <span className="Label__discriminator">#{author.d}</span>}
        </div>
    );
};

export default memo(AuthorLabel) as typeof AuthorLabel;
