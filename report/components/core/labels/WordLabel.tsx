import { memo } from "react";

import { useDataProvider } from "@report/DataProvider";
import { BaseLabel, LabelProps } from "@report/components/core/labels/BaseLabel";

const _WordLabel = ({ index }: LabelProps) => {
    const dp = useDataProvider();
    const word = dp.database.words[index];

    return <BaseLabel title={word} name={word} />;
};

export const WordLabel = memo(_WordLabel) as typeof _WordLabel;
