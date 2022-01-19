interface EmojisData {
    [emoji: string]: {
        // name
        n: string;
        // sentiment
        s: number;
    };
}

export class Emojis {
    constructor(public readonly data: EmojisData) {}

    public getName(emoji: string): string {
        return this.data[emoji] ? this.data[emoji].n : emoji;
    }

    public getSentiment(emoji: string): number {
        return this.data[emoji] ? this.data[emoji].s : 0;
    }
}
