import { memo } from "react";

import { getDatabase } from "@report/WorkerWrapper";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

const _MentionLabel = ({ index }: LabelProps) => {
    const db = getDatabase();
    const mention = db.mentions[index];

    const name = (
        <>
            <span style={{ color: "#eded3d" }}>@</span>
            {mention}
        </>
    );

    return <BaseLabel title={mention} name={name} />;
};

export const MentionLabel = memo(_MentionLabel) as typeof _MentionLabel;
