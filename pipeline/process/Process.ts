import { ReportConfig } from "@pipeline/Types";
import { StepMessage } from "@pipeline/Messages";
import { Database } from "@pipeline/parse/Database";
import { Author, Channel, ID, ReportData, SerializedData } from "@pipeline/process/ReportData";
import { dateToString, monthToString, searchFormat } from "@pipeline/Utils";
import { DataSerializer } from "@pipeline/shared/SerializedData";

export const processDatabase = async function* (
    database: Database,
    config: ReportConfig
): AsyncGenerator<StepMessage, [ReportData, SerializedData]> {
    const authors: Author[] = [];
    const channels: Channel[] = [];

    yield { type: "new", title: "Processing authors" };
    for (let id: ID = 0; id < database.authors.length; id++) {
        const author = database.authors[id];
        authors.push({
            name: author.name,
            name_searchable: searchFormat(author.name),
            bot: author.bot,
            messagesCount: 0,
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
            messagesAddr: -1,
            messagesCount: 0,
        };
        channels.push(channel);
    }
    yield { type: "done" };

    // TOOD: sort by bots
    // TODO: sort by number of messages

    const serializer = new DataSerializer();
    const start = new Date(database.minDate);
    const end = new Date(database.maxDate);
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());

    const dayKeys: string[] = [];
    const monthKeys: string[] = [];

    for (let day = new Date(startUTC); day <= end; day.setDate(day.getDate() + 1)) {
        const dayKey = dateToString(day);
        const monthKey = monthToString(day);

        dayKeys.push(dayKey);
        if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
    }

    for (let id: ID = 0; id < database.channels.length; id++) {
        const msgs = database.messages[id];
        channels[id].messagesAddr = serializer.currentOffset;
        channels[id].messagesCount = msgs.length;

        for (const msg of msgs) {
            const date = new Date(msg.timestamp);
            const tsUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
            const dateUTC = new Date(tsUTC);

            authors[msg.authorId].messagesCount++;

            serializer.writeDate(
                dayKeys.indexOf(dateToString(dateUTC)),
                monthKeys.indexOf(monthToString(dateUTC)),
                dateUTC.getHours() // TODO: timezones and stuff
            );
            serializer.writeUint32(msg.authorId);
        }
    }

    const reportData: ReportData = {
        config,
        title: database.title,
        time: {
            // TODO: timezones
            minDate: dateToString(start),
            maxDate: dateToString(end),
            numDays: dayKeys.length,
            numMonths: monthKeys.length,
        },

        channels,
        authors,
    };

    return [reportData, serializer.validBuffer];
};
