import { Database, ID } from "@pipeline/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { Filters } from "@pipeline/aggregate/Filters";
import { MessageView } from "@pipeline/serialization/MessageView";

export const parseAndFilterMessages = (
    fn: (msg: MessageView, channelId: ID) => void,
    database: Database,
    filters: Filters,
    activeFilters = { channels: true, authors: true, time: true }
) => {
    const stream = new BitStream(database.serialized?.buffer);
    for (let i = 0; i < database.channels.length; i++) {
        // filter channel
        if (activeFilters.channels && !filters.hasChannel(i)) continue;
        const channel = database.channels[i];

        // seek
        stream.offset = channel.msgAddr;

        // read messages
        for (let read = 0; read < channel.msgCount; read++) {
            const message = new MessageView(stream, database.bitConfig);
            // filter author
            if (!activeFilters.authors || filters.hasAuthor(message.authorId)) {
                // filter time
                if (!activeFilters.time || filters.inTime(message.dayIndex)) {
                    // make sure to preserve the offset, since reading an index array will overwrite it
                    let prevOffset = stream.offset;
                    fn(message, i);
                    stream.offset = prevOffset;
                }
            }
        }
    }
};
