import { NewAuthor } from "../../../analyzer/Analyzer";
import ImageSmooth from "../basic/ImageSmooth";
import { platform } from "../../DataProvider";

interface Props {
    data: NewAuthor;
}

import avatar_0 from "../../assets/discord/avatar_0.png";
import avatar_1 from "../../assets/discord/avatar_1.png";
import avatar_2 from "../../assets/discord/avatar_2.png";
import avatar_3 from "../../assets/discord/avatar_3.png";
import avatar_4 from "../../assets/discord/avatar_4.png";
const DiscordDefaultAvatars = [avatar_0, avatar_1, avatar_2, avatar_3, avatar_4];

const AuthorChip = ({ data }: Props) => {
    let placeholder: JSX.Element | null;
    if (platform === "discord") {
        placeholder = (
            <img
                src={DiscordDefaultAvatars[data.discord!.discriminator]}
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

    const avatar = data.avatarUrl ? <ImageSmooth src={data.avatarUrl} children={placeholder} /> : placeholder;

    return (
        <div className="Chip">
            <div className="Chip__Avatar">{avatar}</div>
            <span>{data.name}</span>
        </div>
    );
};

export default AuthorChip;
