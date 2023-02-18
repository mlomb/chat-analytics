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

    /** Edit time distribution in seconds */
    timeDistribution: VariableDistribution;
}

const fn: BlockFn<MessagesEdited> = (database, filters) => {
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);

    const editTimes = new Uint32Array(database.numMessages).fill(0xfffffff0);
    let editTimesCount = 0;

    const processMessage = (msg: MessageView) => {
        if (msg.hasEdits) {
            authorsCount[msg.authorIndex]++;
            channelsCount[msg.channelIndex]++;
            editTimes[editTimesCount++] = msg.editedAfter!;
        }
    };

    filterMessages(processMessage, database, filters);

    return {
        count: {
            authors: authorsCount,
            channels: channelsCount,
        },
        timeDistribution: computeVariableDistribution(editTimes, editTimesCount),
    };
};

export default {
    key: "messages-edited",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages-edited", MessagesEdited>;
