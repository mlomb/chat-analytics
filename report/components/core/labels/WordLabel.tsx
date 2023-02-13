import { memo } from "react";

import { getDatabase } from "@report/WorkerWrapper";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

const _WordLabel = ({ index }: LabelProps) => {
    const db = getDatabase();
    const word = db.words[index];

    return <BaseLabel title={word} name={word} />;
};

export const WordLabel = memo(_WordLabel) as typeof _WordLabel;
