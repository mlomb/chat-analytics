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
    const author = dp.reportData.authors[id] as any; // TODO: fix

    if (author === undefined) {
        return <span>invalid author id {id}</span>;
    }

    author.avatarUrl = "https://i.pinimg.com/474x/b5/35/12/b53512653d7aff159870fc2d96c703bf.jpg";

    const platform = "discord";
    let placeholder: JSX.Element | null;
    if (platform === "discord") {
        placeholder = (
            <img
                src={DiscordDefaultAvatars[author.discord?.discriminator]}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
        );
    } else if (platform === "telegram") {
        placeholder = <div>A</div>; // TODO: telegram avatars
    } else {
        placeholder = null;
    }

    const avatar = author.avatarUrl ? <ImageSmooth src={author.avatarUrl} children={placeholder} /> : placeholder;

    return (
        <div className="Label">
            <div className="Label__Avatar">{avatar}</div>
            <span>{author.n}</span>
        </div>
    );
};

export default memo(AuthorLabel) as typeof AuthorLabel;
