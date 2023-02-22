import { MessagesEdited } from "@pipeline/aggregate/blocks/messages/MessagesEdited";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import AnimatedBars, { AnimatedBarEntry } from "@report/components/viz/AnimatedBars";

const EditedMessages = ({ data, options }: { data?: MessagesEdited; options: number[] }) => {
    // test
    const bars: AnimatedBarEntry[] =
        ((options[0] === 0 ? data?.count.authors : data?.count.channels) || [])
            .map((value, index) => ({
                index,
                value,
            }))
            .slice(0, 5) || [];

    const what = options[0] === 0 ? "Author" : "Channel";
    const itemComponent = options[0] === 0 ? AuthorLabel : ChannelLabel;
    const maxItems = 5;
    const colorHue = options[0] === 0 ? 240 : 266;

    return (
        <>
            <AnimatedBars
                what={what}
                unit="# of messages edited ✏️"
                data={bars}
                itemComponent={itemComponent}
                maxItems={maxItems}
                colorHue={colorHue}
            />
            <AnimatedBars
                what={what}
                unit="% of messages edited ✏️"
                data={bars}
                itemComponent={itemComponent}
                maxItems={maxItems}
                colorHue={colorHue}
            />
        </>
    );
};

export default EditedMessages;
