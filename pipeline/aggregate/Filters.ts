import { Database, ID } from "@pipeline/Types";

export class Filters {
    channels: ID[];
    authors: Uint8Array;
    startDate: string; // TODO: date string
    endDate: string;

    constructor(database: Database) {
        this.channels = [];
        this.authors = new Uint8Array(database.authors.length);
        this.startDate = "";
        this.endDate = "";
    }

    hasChannel(channelId: number): boolean {
        // there arent that many channels
        // no need to optimize
        return this.channels.indexOf(channelId) !== -1;
    }
    hasAuthor(authorId: number): boolean {
        return this.authors[authorId] > 0;
    }
    // TODO: date index check

    updateEndDate(endDate: any) {
        this.endDate = endDate;
    }
    updateStartDate(startDate: any) {
        this.startDate = startDate;
    }
    updateChannels(channels: ID[]) {
        this.channels = channels;
    }
    updateAuthors(authors: ID[]) {
        this.authors.fill(0);
        for (const authorId of authors) this.authors[authorId] = 1;
    }
}
