import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface MessagesEdited {
    authorsCount: number[];
    channelsCount: number[];
}

const fn: BlockFn<MessagesEdited> = (database, filters) => {
    const res: MessagesEdited = {
        authorsCount: new Array(database.authors.length).fill(0),
        channelsCount: new Array(database.channels.length).fill(0),
    };

    const processMessage = (msg: MessageView) => {
        if (msg.hasEdits) {
            res.authorsCount[msg.authorIndex]++;
            res.channelsCount[msg.channelIndex]++;
        }
    };

    filterMessages(processMessage, database, filters);

    return res;
};

export default {
    key: "messages-edited",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"messages-edited", MessagesEdited>;
