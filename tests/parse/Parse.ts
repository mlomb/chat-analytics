import "jest-extended";

import { FileInput, wrapStringAsFile } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PCall, PChannel, PGuild, PMessage } from "@pipeline/parse/Types";

import { loadSample } from "@tests/samples";

/** True output from the Parser after running the inputs */
export interface ParseResult {
    guilds: PGuild[];
    channels: PChannel[];
    authors: PAuthor[];
    messages: PMessage[];
    calls: PCall[];
}

/** The structure we expect after running the Parser with the inputs */
export interface ExpectedPartialParseResult {
    guilds: Partial<PGuild>[];
    channels: Partial<PChannel>[];
    authors: Partial<PAuthor>[];
    messages: Partial<PMessage>[];
    calls: Partial<PCall>[];
}

/** Convenient function to inspect the objects emitted by a parser for specific inputs */
export const runParser = async (klass: new () => Parser, inputs: FileInput[]): Promise<ParseResult> => {
    let parsed: ParseResult = {
        guilds: [],
        channels: [],
        authors: [],
        messages: [],
        calls: [],
    };
    let lastMsgTimestamp: number | undefined;

    const parser = new klass();
    parser.on("guild", (guild) => parsed.guilds.push(guild));
    parser.on("channel", (channel) => parsed.channels.push(channel));
    parser.on("author", (author) => parsed.authors.push(author));
    parser.on("message", (message) => {
        parsed.messages.push(message);

        // bonus check
        // check that messages are emitted in chronological order, WHITHIN EACH FILE
        if (lastMsgTimestamp === undefined) lastMsgTimestamp = message.timestamp;
        else expect(message.timestamp).toBeGreaterThanOrEqual(lastMsgTimestamp);
    });
    parser.on("call", (call) => parsed.calls.push(call));

    for (const input of inputs) {
        // new file, reset
        lastMsgTimestamp = undefined;

        for await (const _ of parser.parse(input)) continue;
    }

    return parsed;
};

/** Convenient function to inspect the objects emitted by a parser from a string */
export const runParserFromString = async (klass: new () => Parser, inputs: string[]): Promise<ParseResult> =>
    runParser(klass, inputs.map(wrapStringAsFile));

/** Checks if a group of samples matches the set of expected parse results */
export const checkSamplesAreParsedCorrectly = async (klass: new () => Parser, filenames: string[]) => {
    const samples = await Promise.all(filenames.map((sample) => loadSample(sample)));
    const parsed = await runParser(
        klass,
        samples.map((s) => s.input)
    );

    for (const sample of samples) {
        const expected = sample.expectedParse!;

        expect(parsed.guilds).toIncludeAllPartialMembers(expected.guilds);
        expect(parsed.channels).toIncludeAllPartialMembers(expected.channels);
        expect(parsed.authors).toIncludeAllPartialMembers(expected.authors);
        expect(parsed.messages).toIncludeAllPartialMembers(expected.messages);
        expect(parsed.calls).toIncludeAllPartialMembers(expected.calls);
    }
};
