import "jest-extended";
import path from "path";

import { loadFile } from "@lib/NodeEnv";
import { FileInput, wrapStringAsFile } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild, PMessage } from "@pipeline/parse/Types";

const SAMPLE_PATH = (sample: string) => path.join(__dirname, `../samples/${sample}`);

/** True output from the Parser after running the inputs */
export interface ParseResult {
    guilds: PGuild[];
    channels: PChannel[];
    authors: PAuthor[];
    messages: PMessage[];
}

/** The structure we expect after running the Parser with the inputs */
export interface ExpectedPartialParseResult {
    guilds: Partial<PGuild>[];
    channels: Partial<PChannel>[];
    authors: Partial<PAuthor>[];
    messages: Partial<PMessage>[];
}

/** Convenient function to inspect the objects emitted by a parser for specific inputs */
export const runParser = async (klass: new () => Parser, inputs: FileInput[]): Promise<ParseResult> => {
    let parsed: ParseResult = {
        guilds: [],
        channels: [],
        authors: [],
        messages: [],
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

/**
 * Convenient function to inspect the objects emitted by a parser from sample files
 *
 * @param samples it expects the path relative to `@tests/samples`, e.g. `discord/DM_2A_2M.json`
 */
export const runParserFromSamples = async (klass: new () => Parser, samples: string[]): Promise<ParseResult> =>
    runParser(klass, await Promise.all(samples.map((fn) => loadFile(SAMPLE_PATH(fn)))));

/** Checks if a group of samples matches the set of expected parse results */
export const checkSamplesAreParsedCorrectly = async (klass: new () => Parser, samples: string[]) => {
    const parsed = await runParserFromSamples(klass, samples);

    for (const filename of samples) {
        const sampleModule = await import(SAMPLE_PATH(filename) + ".ts");
        const expectedParse: ExpectedPartialParseResult = sampleModule.expectedParse;

        expect(parsed.guilds).toIncludeAllPartialMembers(expectedParse.guilds);
        expect(parsed.channels).toIncludeAllPartialMembers(expectedParse.channels);
        expect(parsed.authors).toIncludeAllPartialMembers(expectedParse.authors);
        expect(parsed.messages).toIncludeAllPartialMembers(expectedParse.messages);
    }
};
