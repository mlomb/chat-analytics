import { unzipSync } from "fflate";
import { Parser } from "@pipeline/parse/Parser";
import { FileInput } from "@pipeline/File";

import { JSONStream } from "@pipeline/parse/JSONStream";
import { streamJSONFromFile } from "@pipeline/File";

// JSON format information can be found here:
// https://slack.com/help/articles/220556107-How-to-read-Slack-data-exports
//
export class SlackParser extends Parser {
    async *parse(file: FileInput) {
        // NOTE: we are loading the entire file into memory here
        // this will not work for large files
        const fileBuffer = await file.slice();

        const unzippedFiles = unzipSync(new Uint8Array(fileBuffer));
        const files = Object.keys(unzippedFiles);

        console.log(files);
    }
}
