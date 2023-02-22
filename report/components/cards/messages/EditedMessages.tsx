import { useBlockData } from "@report/BlockHook";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import AnimatedBars, { AnimatedBarEntry } from "@report/components/viz/AnimatedBars";

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

const EditedMessages = ({ options }: { options: number[] }) => {
    const msgEdited = useBlockData("messages-edited");
    const msgStats = useBlockData("messages-stats");

    let byCount: AnimatedBarEntry[] = [];
    let byPercent: AnimatedBarEntry[] = [];

    if (msgEdited && msgStats) {
        const key = options[0] === 0 ? "authors" : "channels";

        byCount = msgEdited.count[key]
            .map((value, index) => ({
                index,
                value,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        byPercent = msgEdited.count[key]
            .map((value, index) => ({
                index,
                value: (value / msgStats.counts[key][index]) * 100,
            }))
            .filter((entry) => msgStats.counts[key][entry.index] > 100) // filter out less than 100 messages
            .filter((entry) => entry.value > 0) // filter out 0% edits
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }

    const what = options[0] === 0 ? "Author" : "Channel";
    const itemComponent = options[0] === 0 ? AuthorLabel : ChannelLabel;
    const maxItems = 5;
    const colorHue = options[0] === 0 ? 240 : 266;

    return (
        <>
            <AnimatedBars
                what={what}
                unit="# of messages edited ✏️"
                data={byCount}
                itemComponent={itemComponent}
                maxItems={maxItems}
                colorHue={colorHue}
            />
            <AnimatedBars
                what={what}
                unit="% of messages edited ✏️"
                data={byPercent}
                itemComponent={itemComponent}
                maxItems={maxItems}
                colorHue={colorHue}
                maxValue={100}
                formatNumber={formatPercent}
            />
        </>
    );
};

export default EditedMessages;
