import { FileInput } from "@pipeline/File";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";

export abstract class Parser {
    constructor(protected readonly builder: DatabaseBuilder) {}

    // NOTE: should yield every so often to process messages
    // for example, every few MBs or hundreds of messages
    abstract parse(file: FileInput): AsyncGenerator<void>;
}
