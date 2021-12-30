import { FileInput } from "@pipeline/File";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";

export abstract class Parser {
    constructor(protected readonly builder: DatabaseBuilder) {}

    abstract parse(file: FileInput): AsyncGenerator<void>;
}
