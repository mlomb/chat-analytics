import path from "path";

import { loadFile } from "@lib/NodeEnv";
import { FileInput, wrapStringAsFile } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild, PMessage } from "@pipeline/parse/Types";

export interface ParseResult {
    guilds: PGuild[];
    channels: PChannel[];
    authors: PAuthor[];
    messages: PMessage[];
}

/** Convenient function to inspect the objects emitted by a parser for specific inputs */
export const runParser = async (klass: new () => Parser, inputs: FileInput[]): Promise<ParseResult> => {
    let parsed: ParseResult = {
        guilds: [],
        channels: [],
        authors: [],
        messages: [],
    };

    const parser = new klass();
    parser.on("guild", (guild) => parsed.guilds.push(guild));
    parser.on("channel", (channel) => parsed.channels.push(channel));
    parser.on("author", (author) => parsed.authors.push(author));
    parser.on("message", (message) => parsed.messages.push(message));

    for (const input of inputs) {
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
 * @param sample_filenames it expects the path relative to `samples`, e.g. `discord/DM_2A_2M.json`
 */
export const runParserFromSamples = async (klass: new () => Parser, sample_filenames: string[]): Promise<ParseResult> =>
    runParser(
        klass,
        await Promise.all(sample_filenames.map((fn) => loadFile(path.join(__dirname, `../samples/${fn}`))))
    );
