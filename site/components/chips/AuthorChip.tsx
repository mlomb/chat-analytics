import { Platform } from "../../../analyzer/Types";
import { NewAuthor } from "../../../analyzer/Analyzer";
import { Img } from 'react-image';

interface Props {
    platform: Platform,
    author: NewAuthor
};

import avatar_0 from "../../assets/discord/avatar_0.png";
import avatar_1 from "../../assets/discord/avatar_1.png";
import avatar_2 from "../../assets/discord/avatar_2.png";
import avatar_3 from "../../assets/discord/avatar_3.png";
import avatar_4 from "../../assets/discord/avatar_4.png";
import ImageSmooth from "../basic/ImageSmooth";
const DiscordDefaultAvatars = [avatar_0, avatar_1, avatar_2, avatar_3, avatar_4];

const AuthorChip = ({ platform, author }: Props) => {
    let placeholder: JSX.Element;
    if(platform === "discord") {
        placeholder = <img
            src={DiscordDefaultAvatars[author.discord!.discriminator]}
            style={{
                width: "100%",
                height: "100%",
            }}
        />;
    } else if(platform === "telegram") {
        placeholder = <div>A</div>; // TODO
    } else {
        placeholder = <div>Nope</div>;
    }

    const avatar = author.avatarUrl ? <ImageSmooth src={author.avatarUrl} children={placeholder} /> : placeholder;

    return <div className="Chip">
        <div style={{
            position: "relative",
            width: 20,
            height: 20,
            overflow: "hidden",
            borderRadius: "50%"
        }}>
            {avatar}
        </div>
        <span>{author.name}</span>
    </div>
};

export default AuthorChip;