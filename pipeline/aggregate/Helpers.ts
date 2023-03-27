import { Filters } from "@pipeline/aggregate/Filters";
import { Database } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessageView } from "@pipeline/serialization/MessageView";

/**
 * Filter messages in a database with the specified filters.
 * Calls the given function for each message that passes the filters.
 *
 * @param fn function to call for each message
 * @param activeFilters select which filters to apply
 */
export const filterMessages = (
    fn: (msg: MessageView) => void,
    database: Database,
    filters: Filters,
    activeFilters = { channels: true, authors: true, time: true }
) => {
    const stream = new BitStream(database.messages!.buffer);
    for (let channelIndex = 0; channelIndex < database.channels.length; channelIndex++) {
        // filter channel
        if (activeFilters.channels && !filters.hasChannel(channelIndex)) continue;
        const channel = database.channels[channelIndex];

        if (channel.msgAddr === undefined) continue;
        if (channel.msgCount === undefined) continue;

        // seek
        stream.offset = channel.msgAddr;

        // read messages
        for (let read = 0; read < channel.msgCount; read++) {
            const message = new MessageView(stream, database.bitConfig);
            // filter time
            if (!activeFilters.time || filters.inTime(message.dayIndex)) {
                // filter author
                if (!activeFilters.authors || filters.hasAuthor(message.authorIndex)) {
                    // make sure to preserve the offset, since reading properties inside `fn` changes the offset
                    const prevOffset = stream.offset;
                    message.guildIndex = channel.guildIndex;
                    message.channelIndex = channelIndex;
                    fn(message);
                    stream.offset = prevOffset;
                }
            }
        }
    }
};
