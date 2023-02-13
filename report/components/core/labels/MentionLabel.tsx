import { memo } from "react";

import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

const _MentionLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const mention = dp.database.mentions[index];

    const name = (
        <>
            <span style={{ color: "#eded3d" }}>@</span>
            {mention}
        </>
    );

    return <BaseLabel title={mention} name={name} />;
};

export const MentionLabel = memo(_MentionLabel) as typeof _MentionLabel;
