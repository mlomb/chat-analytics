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
    const channels: Channel[] = [];
    const authors: Author[] = [];
    let totalMessages = 0;

    ///
    /// CHANNELS
    ///
    yield { type: "new", title: "Processing channels" };
    for (let id: ID = 0; id < database.channels.length; id++) {
        const channel = database.channels[id];
        channels.push({
            n: channel.name,
            ns: searchFormat(channel.name),
            // filled later
            msgAddr: 0,
            msgCount: 0,
        });
        totalMessages += database.messages[id].length;
        // there arent that many channels, so we can afford not to throttle
        yield { type: "progress", format: "number", progress: [id + 1, database.channels.length] };
    }
    yield { type: "done" };

    ///
    /// AUTHORS
    ///
    yield { type: "new", title: "Processing authors" };
    const authorsThrottler = createThrottler(database.authors.length);
    for (let id: ID = 0; id < database.authors.length; id++) {
        const author = database.authors[id];
        const newAuthor: Author = {
            n: author.name,
            ns: searchFormat(author.name),
            b: author.bot,
        };
        if (author.discord?.discriminator) newAuthor.d = author.discord.discriminator;
        authors.push(newAuthor);
        if (authorsThrottler(id))
            yield { type: "progress", format: "number", progress: [id + 1, database.authors.length] };
    }
    yield { type: "done" };

    ///
    /// MESSAGES
    ///
    const start = new Date(database.minDate);
    const end = new Date(database.maxDate);
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const authorMessagesCount: number[] = new Array(database.authors.length).fill(0);
    const serializer = new DataSerializer();

    const dayKeys: string[] = [];
    const monthKeys: string[] = [];

    for (let day = new Date(startUTC); day <= end; day.setDate(day.getDate() + 1)) {
        const dayKey = dateToString(day);
        const monthKey = monthToString(day);

        dayKeys.push(dayKey);
        if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
    }

    yield { type: "new", title: "Processing messages" };
    const messagesThrottler = createThrottler(totalMessages);
    let messagesProcessed = 0;
    for (let id: ID = 0; id < database.channels.length; id++) {
        const msgs = database.messages[id];
        channels[id].msgAddr = serializer.currentOffset;
        channels[id].msgCount = msgs.length;

        for (const msg of msgs) {
            const date = new Date(msg.timestamp);
            const tsUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
            const dateUTC = new Date(tsUTC);

            authorMessagesCount[msg.authorId]++;

            serializer.writeDate(
                dayKeys.indexOf(dateToString(dateUTC)),
                monthKeys.indexOf(monthToString(dateUTC)),
                dateUTC.getHours() // TODO: timezones and stuff
            );
            serializer.writeUint32(msg.authorId);

            messagesProcessed++;
            if (messagesThrottler(messagesProcessed))
                yield { type: "progress", format: "number", progress: [messagesProcessed, totalMessages] };
        }
    }
    yield { type: "done" };

    yield { type: "new", title: "Sorting authors" };
    const authorsOrder: ID[] = Array.from({ length: authors.length }, (_, i) => i);
    authorsOrder.sort((a, b) =>
        // first non-bots, then by messages count
        authors[a].b === authors[b].b ? authorMessagesCount[b] - authorMessagesCount[a] : +authors[a].b - +authors[b].b
    );
    const authorsBotCutoff: number = authorsOrder.findIndex((i) => authors[i].b);
    yield { type: "done" };

    // store avatars but only for the most active 1000 authors
    // storing all avatars takes too much space
    const maxAuthorsWithAvatars = Math.min(authors.length, 1000);
    for (let i = 0; i < maxAuthorsWithAvatars; i++) {
        const authorId = authorsOrder[i];
        if (database.authors[authorId].discord?.avatar)
            authors[authorId].da = database.authors[authorId].discord?.avatar;
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
        authorsOrder,
        authorsBotCutoff,
    };

    return [reportData, serializer.validBuffer];
};

// throttle without using setTimeout (the last call is not guaranteed)
// 1% of processed items or 15ms
const createThrottler = (total: number): ((it: number) => boolean) => {
    const dateThrottle = 100; // check time only every 100 items
    const onePercent = Math.ceil(total * 0.01);

    let lastCount = 0;
    let lastTs = 0;
    return (it: number) => {
        let now = 0;
        let ok = it - lastCount > onePercent;
        if (it - lastCount > dateThrottle) {
            now = Date.now();
            ok = ok || now - lastTs > 15;
        }
        if (ok) {
            lastTs = now || Date.now();
            lastCount = it;
        }
        return ok;
    };
};
