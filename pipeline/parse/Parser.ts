import { EventEmitter } from "events";

import { Progress } from "@pipeline/Progress";
import { Timestamp } from "@pipeline/Types";
import { FileInput } from "@pipeline/parse/File";
import { PAuthor, PCall, PChannel, PGuild, PMessage } from "@pipeline/parse/Types";

// prettier-ignore
export declare interface Parser {
    // The `at` parameter represents how up-to-date the information is.
    // For example, the timestamp when the export file was generated.
    // For clarification, in messages it is NOT the timestamp of when the message was *sent*!
    // This allows us to keep the most up to date information (last nickname, avatar, etc)
    // If you don't have this information, just omit the parameter.

    emit(event: "guild",   guild:   PGuild,   at?: Timestamp): boolean;
    emit(event: "channel", channel: PChannel, at?: Timestamp): boolean;
    emit(event: "author",  author:  PAuthor,  at?: Timestamp): boolean;
    emit(event: "message", message: PMessage, at?: Timestamp): boolean;
    emit(event: "call",    call:    PCall,    at?: Timestamp): boolean;

    on(event: "guild",   listener: (guild:   PGuild,   at?: Timestamp) => void): this;
    on(event: "channel", listener: (channel: PChannel, at?: Timestamp) => void): this;
    on(event: "author",  listener: (author:  PAuthor,  at?: Timestamp) => void): this;
    on(event: "message", listener: (message: PMessage, at?: Timestamp) => void): this;
    on(event: "call",    listener: (call:    PCall,    at?: Timestamp) => void): this;

    // Allows the parser to notify if messages become out of order.
    // This can happen if the export has daylight savings time.
    emit(event: "out-of-order"): boolean;
    on(event: "out-of-order", listener: () => void): this;
}

export abstract class Parser extends EventEmitter {
    /**
     * Parses the given input file. It should emit events with the parsed data.
     *
     * Note that this function should yield every so often (e.g. every few MBs or hundreds of messages)
     * to process messages and report progress back to the UI.
     */
    abstract parse(file: FileInput, progress?: Progress): AsyncGenerator<void>;
}
