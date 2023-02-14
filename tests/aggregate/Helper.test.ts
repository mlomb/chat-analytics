import { Index } from "@pipeline/Types";
import { computeCommonBlockData } from "@pipeline/aggregate/Common";
import { Filters } from "@pipeline/aggregate/Filters";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { Database, Message } from "@pipeline/process/Types";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessagesArray } from "@pipeline/serialization/MessagesArray";

import { loadTestDatabase } from "@tests/aggregate/Common";

let db: Database;
let fn: jest.Mock;
let filters: Filters;

let allowedAuthors: Index[];
let allowedChannels: Index[];
let allowedDays: Index[];

let allMessages: { msg: Message; channelIndex: Index }[];

beforeEach(async () => {
    fn = jest.fn();
    db = await loadTestDatabase();

    allMessages = [];
    for (const channel of db.channels) {
        const channelIndex = db.channels.indexOf(channel);
        const stream = new BitStream(db.messages.buffer);
        if (channel.msgAddr !== undefined) {
            stream.offset = channel.msgAddr;
            const arr = new MessagesArray(db.bitConfig, stream, channel.msgCount);
            for (const msg of arr) {
                allMessages.push({ msg, channelIndex });
            }
        }
    }

    const dateKeys = computeCommonBlockData(db).timeKeys.dateKeys;
    allowedAuthors = db.authors.slice(0, db.authors.length / 2).map((_, i) => i);
    allowedChannels = db.channels.slice(0, db.channels.length / 2).map((_, i) => i);
    const days = dateKeys.slice(dateKeys.length / 3, (dateKeys.length / 3) * 2);
    allowedDays = days.map((_, i) => dateKeys.length / 3 + i);

    filters = new Filters(db);
    filters.updateAuthors(allowedAuthors);
    filters.updateChannels(allowedChannels);
    filters.updateStartDate(days[0]);
    filters.updateEndDate(days[days.length - 1]);
});

it("should have the correct number of active days", () => {
    expect(filters.numActiveDays).toBe(allowedDays.length);
});

describe("filterMessages", () => {
    // prettier-ignore
    test.each([
        { authors: false, channels: false, time: false, },
        { authors: false, channels: false, time: true, },
        { authors: false, channels: true, time: false, },
        { authors: false, channels: true, time: true, },
        { authors: true, channels: false, time: false, },
        { authors: true, channels: false, time: true, },
        { authors: true, channels: true, time: false, },
        { authors: true, channels: true, time: true, },
    ])(`filters with active %p`, (activeFilters) => {
        filterMessages(fn, db, filters, activeFilters);

        const expectedMessages = allMessages.filter(({channelIndex,msg}) => {
            return (
                (!activeFilters.authors || allowedAuthors.includes(msg.authorIndex)) &&
                (!activeFilters.channels || allowedChannels.includes(channelIndex)) &&
                (!activeFilters.time || allowedDays.includes(msg.dayIndex))
            );
        });

        expect(fn).toHaveBeenCalledTimes(expectedMessages.length);

        for (const { msg } of expectedMessages) {
            expect(fn).toHaveBeenCalledWith(expect.objectContaining({
                authorIndex: msg.authorIndex,
                dayIndex: msg.dayIndex,
                secondOfDay: msg.secondOfDay,
                langIndex: msg.langIndex,
            }));
        }
    });
});
