import { Env } from "@pipeline/Env";

interface EmojisData {
    [emoji: string]: {
        // name
        n: string;
        // sentiment
        s?: number;
    };
}

/** Emojis database */
export class Emojis {
    constructor(public readonly data: EmojisData) {}

    /** Returns the name of an emoji e.g. 💓 → "beating heart" */
    public getName(emoji: string): string {
        return this.data[emoji] ? this.data[emoji].n : emoji;
    }

    /** Returns the sentiment of an emoji. e.g. 😡 → negative, ❤ → positive, 🟪 → 0. Always [-1, 1] */
    public getSentiment(emoji: string): number {
        return this.data[emoji]?.s || 0;
    }

    static async load(env: Env) {
        return new Emojis(await env.loadAsset<EmojisData>("/data/emojis/emoji-data.json", "json"));
    }
}
