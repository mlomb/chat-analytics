import { FileInput, ProgressStep } from "@pipeline/Types";

import oboe, { Oboe } from "oboe";

const CHUNK_SIZE = 1024 * 1024 * (2 * 2); // 4MB

/*
    Allows streaming big JSON files
    >2GB, >4GB, etc

    NOTES:

    We are using Oboe.js, tough it may be better to use clarinet (what oboe uses) and parse the events ourselves.
    Oboe is slow and no longer mantained.

    What about dominictarr/JSONStream? It does not work in browsers and also archived :(

    TODO: some day migrate to clarinet or something mantained
*/
export default class JSONStream {
    private oboe: Oboe;

    constructor(private readonly file: FileInput) {
        this.oboe = oboe();
        this.oboe.fail((failReason) => {
            throw new Error(`Make sure it is a valid JSON file.\nDetails: ${failReason.thrown?.message}`);
        });
    }

    public on<T>(pattern: string, callback: (object: T) => void) {
        // Oboe.js examples
        // https://web.archive.org/web/20200807153925/http://www.oboejs.com/examples
        this.oboe.node(pattern, callback);
    }

    public async *parse(): AsyncGenerator<ProgressStep> {
        const textDecoder = new TextDecoder("utf-8");

        let receivedLength = 0;
        while (receivedLength < this.file.size) {
            const buffer = await this.file.slice(receivedLength, receivedLength + CHUNK_SIZE);
            const str = textDecoder.decode(buffer, { stream: true });

            receivedLength += buffer.byteLength;
            this.oboe.emit("data", str);
            yield { type: "progress", format: "bytes", progress: [receivedLength, this.file.size] };
        }
    }
}
