import { memo } from "react";

import { AuthorAvatar } from "@report/components/core/avatars/AuthorAvatar";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

const _AuthorLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const isDemo = dp.database.config.demo;
    const author = dp.database.authors[index];

    const title = author.n + (author.d ? `#${author.d}` : "");
    const avatar = <AuthorAvatar index={index} />;
    const name = (
        <>
            {author.n}
            {author.d && <span className="Label__discriminator">#{`${isDemo ? 0 : author.d}`.padStart(4, "0")}</span>}
        </>
    );

    return <BaseLabel title={title} name={name} avatar={avatar} />;
};

export const AuthorLabel = memo(_AuthorLabel) as typeof _AuthorLabel;
