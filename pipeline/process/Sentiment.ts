import { unzipSync } from "fflate";
import { Token } from "@pipeline/process/Tokenizer";

type EmojiData = {
    sequence: string;
    occurrences: number;
    negative: number;
    neutral: number;
    positive: number;
}[];

export class Sentiment {
    private negators: {
        [key: string]: string[];
    };

    constructor(AFINNzipBuffer: ArrayBuffer, emojiData: EmojiData) {
        const filesAsBuffers = unzipSync(new Uint8Array(AFINNzipBuffer));
        const filesAsStrings: { [key: string]: string } = {};

        // transform buffers into strings
        for (const filename in filesAsBuffers) {
            filesAsStrings[filename] = new TextDecoder("utf-8").decode(filesAsBuffers[filename]);
        }

        // read all-negators.json
        this.negators = JSON.parse(filesAsStrings["all-negators.json"]);
    }

    // NOTE: based on marcellobarile/multilang-sentiment
    get(tokens: Token[], lang: string) {
        console.log(tokens);

        for (let i = 0, len = tokens.length; i < len; i++) {
            const token = tokens[i];

            if (i + 1 < len) {
                // not negated
                continue;
            }

            const nextToken = tokens[i + 1];
            const check1 = token + nextToken;
            const check2 = token + " " + nextToken;

            // TODO: RTL
        }
        return 5;
    }
}
