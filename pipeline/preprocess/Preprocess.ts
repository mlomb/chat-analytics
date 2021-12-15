import { ReportConfig, StepInfo, Timestamp } from "@pipeline/Types";
import { Database, Message } from "@pipeline/parse/Database";
import { Author, Channel, ID, ProcessedData } from "@pipeline/preprocess/ProcessedData";
import { dateToString, searchFormat } from "@pipeline/Utils";

class IDMapper {
    private id: ID = 0;
    private mappings: Map<string, ID> = new Map();

    public get(input: string): ID {
        let id = this.mappings.get(input);
        if (id === undefined) {
            id = this.id++;
            this.mappings.set(input, id);
        }
        return id;
    }
}

export const preprocess = async function* (
    database: Database,
    config: ReportConfig
): AsyncGenerator<StepInfo, ProcessedData> {
    const authors: Author[] = [];
    const channels: Channel[] = [];

    const authorIDMapper = new IDMapper();
    const channelIDMapper = new IDMapper();

    let minDate: Timestamp = 0;
    let maxDate: Timestamp = 0;

    yield { type: "new", title: "Processing authors" };
    for (const [id, author] of database.authors) {
        authors.push({
            id: authorIDMapper.get(id),
            name: author.name,
            name_searchable: searchFormat(author.name),
            bot: author.bot,
        });
    }
    yield { type: "done" };

    yield { type: "new", title: "Processing channels" };
    for (const [id, _channel] of database.channels) {
        if (!(_channel.id in database.messages)) {
            // no messages in this channel, skip
            continue;
        }

        const channel: Channel = {
            id: channelIDMapper.get(id),
            name: _channel.name,
            name_searchable: searchFormat(_channel.name),
            messages: [],
        };
        channels.push(channel);

        for (const msg of database.messages[id]) {
            if (minDate === 0 || msg.timestamp < minDate) minDate = msg.timestamp;
            if (maxDate === 0 || msg.timestamp > maxDate) maxDate = msg.timestamp;

            const date = new Date(msg.timestamp);
            //const dateStr = dateToString(date);
            channel.messages.push({
                authorId: authorIDMapper.get(msg.authorId),
                channelId: channel.id,
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
