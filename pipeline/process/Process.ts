import { ReportConfig, Timestamp } from "@pipeline/Types";
import { StepMessage } from "@pipeline/Messages";
import { Database } from "@pipeline/parse/Database";
import { Author, Channel, ID, ReportData, SerializedData } from "@pipeline/process/ReportData";
import { dateToString, searchFormat } from "@pipeline/Utils";
import { DataSerializer } from "@pipeline/shared/SerializedData";

export const processDatabase = async function* (
    database: Database,
    config: ReportConfig
): AsyncGenerator<StepMessage, [ReportData, SerializedData]> {
    const authors: Author[] = [];
    const channels: Channel[] = [];

    let minDate: Timestamp = 0;
    let maxDate: Timestamp = 0;

    yield { type: "new", title: "Processing authors" };
    for (let id: ID = 0; id < database.authors.length; id++) {
        const author = database.authors[id];
        authors.push({
            name: author.name,
            name_searchable: searchFormat(author.name),
            bot: author.bot,
        });
    }
    yield { type: "done" };

    yield { type: "new", title: "Processing channels" };
    for (let id: ID = 0; id < database.channels.length; id++) {
        const _channel = database.channels[id];
        if (!(id in database.messages)) {
            // no messages in this channel, skip
            continue;
        }

        const channel: Channel = {
            name: _channel.name,
            name_searchable: searchFormat(_channel.name),
            messagesStart: -1,
            messagesEnd: -1,
        };
        channels.push(channel);
    }
    yield { type: "done" };

    // TOOD: sort by bots
    // TODO: sort by number of messages

    const serializer = new DataSerializer();

    for (let id: ID = 0; id < database.channels.length; id++) {
        channels[id].messagesStart = serializer.currentOffset;
        for (const msg of database.messages[id]) {
            if (minDate === 0 || msg.timestamp < minDate) minDate = msg.timestamp;
            if (maxDate === 0 || msg.timestamp > maxDate) maxDate = msg.timestamp;

            const d = new Date(msg.timestamp); // TODO: timezones and stuff
            serializer.writeDate(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours());
            serializer.writeUint32(id);
            serializer.writeUint32(msg.authorId);
        }
        channels[id].messagesEnd = serializer.currentOffset;
    }

    const reportData: ReportData = {
        config,
        title: database.title,
        // TODO: timezones
        minDate: dateToString(new Date(minDate)),
        maxDate: dateToString(new Date(maxDate)),

        channels,
        authors,
    };

    return [reportData, serializer.validBuffer];
};
