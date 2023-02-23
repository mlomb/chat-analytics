import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { VariableDistribution, computeVariableDistribution } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface MessagesEdited {
    count: {
        /** Number of messages edited by each author */
        authors: number[];
        /** Number of messages edited in each channel */
        channels: number[];
    };

    /* Edited in less than 1 second */
    editedInLessThan1Second: number;

    /** Edit time distribution in seconds */
    editTimeDistribution: VariableDistribution;
}

const fn: BlockFn<MessagesEdited> = (database, filters) => {
    const authorsEdited = new Array(database.authors.length).fill(0);
    const channelsEdited = new Array(database.channels.length).fill(0);
    let editedInLessThan1Second = 0;

    const editTimes = new Uint32Array(database.numMessages).fill(0xfffffff0);
    let editTimesCount = 0;

    const processMessage = (msg: MessageView) => {
        if (msg.hasEdits) {
            authorsEdited[msg.authorIndex]++;
            channelsEdited[msg.channelIndex]++;

            const editTime = msg.editedAfter!;

            editTimes[editTimesCount++] = editTime;
            if (editTime <= 1) editedInLessThan1Second++;
        }
    };

    filterMessages(processMessage, database, filters);

    return {
        count: {
            authors: authorsEdited,
            channels: channelsEdited,
        },
        editedInLessThan1Second,
        editTimeDistribution: computeVariableDistribution(editTimes, editTimesCount),
    };
};

export default {
    key: "messages/edited",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages/edited", MessagesEdited>;
