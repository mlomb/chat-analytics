import { ID } from "@pipeline/Types";
import { DateStr } from "@pipeline/process/ReportData";

export class Filters {
    channels: ID[];
    authors: Uint8Array;
    startDate: DateStr;
    endDate: DateStr;

    constructor(numAuthors: number) {
        this.channels = [];
        this.authors = new Uint8Array(numAuthors);
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
