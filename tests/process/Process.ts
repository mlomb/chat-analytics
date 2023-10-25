import { AttachmentType } from "@pipeline/Attachments";
import { Platform } from "@pipeline/Platforms";
import { DateKey, Day } from "@pipeline/Time";
import { generateDatabase } from "@pipeline/index";
import { Author, Call, Channel, Guild, Message } from "@pipeline/process/Types";
import { matchFormat } from "@pipeline/process/nlp/Text";
import { BitStream } from "@pipeline/serialization/BitStream";
import { MessagesArray } from "@pipeline/serialization/MessagesArray";

import { TestEnv, loadSamples } from "@tests/samples";

/** The data we expect after to be included after generating the Database */
export interface ExpectedPartialDatabaseResult {
    minDate: DateKey;
    maxDate: DateKey;
    langs: string[];
    guild: Partial<Guild>;
    channel: Partial<Channel>;
    authors: Partial<Author>[];
    messages: {
        // timezone stuff has to be done before testing this
        // dateKey: DateKey;
        // secondOfDay: number;
        authorName: string;
        langIndex: number;
        words?: [string, number][];
        attachments?: [AttachmentType, number][];
        reactions?: [string, number][];
        mentions?: [string, number][];
        domains?: [string, number][];
    }[];
    calls: Partial<{
        authorName: string;
        duration: number;
    }>[];
}

/** Checks if a group of samples matches the set of expected parse results */
export const checkDatabaseIsGeneratedCorrectly = async (platform: Platform, filenames: string[]) => {
    const samples = await loadSamples(filenames);
    const db = await generateDatabase(
        samples.map((s) => s.input),
        { platform },
        TestEnv
    );

    const formattedWords = db.words.map((w) => matchFormat(w));

    const Day_lteq = (a: Day, b: Day) => Day.lt(a, b) || Day.eq(a, b);
    const Day_gteq = (a: Day, b: Day) => Day.gt(a, b) || Day.eq(a, b);

    for (const sample of samples) {
        const expected = sample.expectedDatabase!;

        expect(Day_lteq(Day.fromKey(db.time.minDate), Day.fromKey(expected.minDate))).toBeTrue();
        expect(Day_gteq(Day.fromKey(db.time.maxDate), Day.fromKey(expected.maxDate))).toBeTrue();
        expect(db.langs).toIncludeAllMembers(expected.langs);
        expect(db.guilds).toIncludeAllPartialMembers([expected.guild]);
        expect(db.channels).toIncludeAllPartialMembers([expected.channel]);
        expect(db.authors).toIncludeAllPartialMembers(expected.authors);

        const guildIndex = db.guilds.findIndex((g) => g.name === expected.guild.name);
        const channelIndex = db.channels.findIndex((c) => c.name === expected.channel.name);

        const channel = db.channels[channelIndex];
        expect(channel.guildIndex).toBe(guildIndex);

        const stream = new BitStream(db.messages.buffer);
        stream.offset = channel.msgAddr || 0;
        const messagesArr = new MessagesArray(db.bitConfig, stream, channel.msgCount);
        const messages = Array.from(messagesArr);

        expect(messages.length).toBeGreaterThanOrEqual(messages.length);

        // const { dateKeys } = genTimeKeys(Day.fromKey(db.time.minDate), Day.fromKey(db.time.maxDate));

        for (const expectedMessage of expected.messages) {
            const toCheck: Partial<Message> = {
                // dayIndex: dateKeys.indexOf(expectedMessage.dateKey),
                // secondOfDay: expectedMessage.secondOfDay,
                authorIndex: db.authors.findIndex((a) => a.n === expectedMessage.authorName),
                langIndex: expectedMessage.langIndex,
            };

            if (expectedMessage.words) {
                toCheck.words = expect.arrayContaining(
                    expectedMessage.words.map(([w, c]) => [formattedWords.indexOf(matchFormat(w)), c])
                );
            }

            if (expectedMessage.attachments) toCheck.attachments = expectedMessage.attachments;

            if (expectedMessage.reactions) {
                toCheck.reactions = expect.arrayContaining(
                    expectedMessage.reactions.map(([name, c]) => [
                        db.emojis.findIndex((r) => r.name === name || (r.type === "unicode" && r.symbol === name)),
                        c,
                    ])
                );
            }

            if (expectedMessage.mentions) {
                toCheck.mentions = expect.arrayContaining(
                    expectedMessage.mentions.map(([m, c]) => [db.mentions.indexOf(m), c])
                );
            }

            if (expectedMessage.domains) {
                toCheck.domains = expect.arrayContaining(
                    expectedMessage.domains.map(([d, c]) => [db.domains.indexOf(d), c])
                );
            }

            // TODO: there is a lot more to test...

            expect(messages).toIncludeAllPartialMembers([toCheck]);
        }

        for (const expectedCall of expected.calls) {
            const toCheck: Partial<Call> = {
                authorIndex: db.authors.findIndex((a) => a.n === expectedCall.authorName),
                duration: expectedCall.duration,
            };

            expect(db.calls).toIncludeAllPartialMembers([toCheck]);
        }
    }
};
