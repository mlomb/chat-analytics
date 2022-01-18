import { Index } from "@pipeline/Types";
import { BlockDescription, BlockFn, IndexEntry } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface EmojiStats {}

const fn: BlockFn<EmojiStats> = (database, filters, common) => {
    const processMessage = (msg: MessageView, channelIndex: Index) => {};

    parseAndFilterMessages(processMessage, database, filters);

    return {};
};

export default {
    key: "emoji-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"emoji-stats", EmojiStats>;
