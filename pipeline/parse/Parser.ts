import { FileInput } from "@pipeline/File";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";

export abstract class Parser {
    constructor(protected readonly builder: DatabaseBuilder) {}

    // Since we want to read messages from past to present,
    // we might need to sort the files in the correct order
    sortFiles(files: FileInput[]): FileInput[] {
        // no sorting by default
        return files;
    }

    // NOTE: should yield every so often to process messages
    // for example, every few MBs or hundreds of messages
    abstract parse(file: FileInput): AsyncGenerator<void>;
}
