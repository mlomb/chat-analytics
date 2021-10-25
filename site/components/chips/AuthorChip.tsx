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
    } else {
        placeholder = <div>Nope</div>;
    }

// <ImageSmooth src={author.avatarUrl} children={placeholder} />
    const avatar = author.avatarUrl ? <Img
    loading="lazy"
    width="100%"
    height="100%"
    src={[author.avatarUrl]}
    unloader={placeholder}
    loader={placeholder}
    decode={false}
    key="pepe"
  /> : placeholder;

    return <div className="chip author-chip">
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