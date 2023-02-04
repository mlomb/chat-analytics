import { Filters } from "@pipeline/aggregate/Filters";
import { Database } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageView } from "@pipeline/serialization/MessageView";

export const parseAndFilterMessages = (
    fn: (msg: MessageView) => void,
    database: Database,
    filters: Filters,
    activeFilters = { channels: true, authors: true, time: true }
) => {
    const stream = new BitStream(database.messages?.buffer);
    for (let ch = 0; ch < database.channels.length; ch++) {
        // filter channel
        if (activeFilters.channels && !filters.hasChannel(ch)) continue;
        const channel = database.channels[ch];

        if (channel.msgAddr === undefined) continue;
        if (channel.msgCount === undefined) continue;

        // seek
        stream.offset = channel.msgAddr;

        // read messages
        for (let read = 0; read < channel.msgCount; read++) {
            const message = new MessageView(stream, database.bitConfig);
            message.guildIndex = channel.guildIndex;
            message.channelIndex = ch;
            // filter author
            if (!activeFilters.authors || filters.hasAuthor(message.authorIndex)) {
                // filter time
                if (!activeFilters.time || filters.inTime(message.dayIndex)) {
                    // make sure to preserve the offset, since reading an index array will overwrite it
                    const prevOffset = stream.offset;
                    fn(message);
                    stream.offset = prevOffset;
                }
            }
        }
    }
};
