import { memo } from "react";

import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";
import { useDataProvider } from "@report/DataProvider";

const _WordLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const word = dp.database.words[index];

    return <BaseLabel title={word} name={word} />;
};

export const WordLabel = memo(_WordLabel) as typeof _WordLabel;
