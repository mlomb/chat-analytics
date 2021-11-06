import { Database } from "@pipeline/Types";

export abstract class Parser {
    abstract parse(files: string[]): Database;
}
