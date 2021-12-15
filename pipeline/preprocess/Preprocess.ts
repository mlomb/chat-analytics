import { ID, ReportConfig, StepInfo, Timestamp } from "@pipeline/Types";
import { Database, Message } from "@pipeline/parse/Database";
import { Author, Channel, ProcessedData } from "@pipeline/preprocess/ProcessedData";
import { dateToString, searchFormat } from "@pipeline/Utils";

export const preprocess = async function* (
    database: Database,
    config: ReportConfig
): AsyncGenerator<StepInfo, ProcessedData> {
    const authors: Author[] = [];
    const channels: Channel[] = [];

    let minDate: Timestamp = 0;
    let maxDate: Timestamp = 0;

    yield { type: "new", title: "Processing authors" };
    for (const [id, author] of database.authors) {
        authors.push({
            id,
            name: author.name,
            name_searchable: searchFormat(author.name),
            bot: author.bot,
        });
    }
    yield { type: "done" };

    yield { type: "new", title: "Processing channels" };
    for (const [id, channel] of database.channels) {
        if (!(channel.id in database.messages)) {
            // no messages in this channel, skip
            continue;
        }
        channels.push({
            id: id,
            name: channel.name,
            name_searchable: searchFormat(channel.name),
            messages: [],
        });
    }
    yield { type: "done" };

    yield { type: "new", title: "Processing messages" };
    for (const channel of channels) {
        for (const msg of database.messages[channel.id]) {
            if (minDate === 0 || msg.timestamp < minDate) minDate = msg.timestamp;
            if (maxDate === 0 || msg.timestamp > maxDate) maxDate = msg.timestamp;

            const date = new Date(msg.timestamp);
            //const dateStr = dateToString(date);
            channel.messages.push({
                authorId: msg.authorId,
                channelId: msg.channelId,
                date: [date.getFullYear(), date.getMonth(), date.getDate()],
            });
        }
    }
    yield { type: "done" };

    // TODO: filter members with no messages
    // TOOD: sort by bots
    // TODO: sort by number of messages

    return {
        platform: database.platform,
        title: database.title,
        // TODO: timezones
        minDate: dateToString(new Date(minDate)),
        maxDate: dateToString(new Date(maxDate)),

        channels,
        authors,
    };
};
