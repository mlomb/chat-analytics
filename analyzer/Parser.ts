import { Database } from "./Types";

export abstract class Parser {
    abstract parse(files: string[]): Database;
}
