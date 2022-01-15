import { Token } from "@pipeline/process/Tokenizer";

export class Sentiment {
    constructor() {}

    get(tokens: Token[]) {
        console.log(tokens);

        return 5;
    }
}
