import { memo } from "react";

import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

const _MentionLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const mention = dp.database.mentions[index];

    return (
        <BaseLabel
            title={mention}
            name={
                <>
                    <span style={{ color: "#eded3d" }}>@</span>
                    {mention}
                </>
            }
        />
    );
};

export const MentionLabel = memo(_MentionLabel) as typeof _MentionLabel;
