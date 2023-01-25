import { wrapStringAsFile } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { PAuthor, PChannel, PGuild, PMessage } from "@pipeline/parse/Types";

export interface ParseResult {
    guilds: PGuild[];
    channels: PChannel[];
    authors: PAuthor[];
    messages: PMessage[];
}

/** Convenient function to inspect the objects emitted by a parser for specific inputs */
export const runParser = async (klass: new () => Parser, inputs: string[]): Promise<ParseResult> => {
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
        for await (const _ of parser.parse(wrapStringAsFile(input))) continue;
    }

    return parsed;
};
