import { Database, DateStr, ID } from "@pipeline/Types";
import { genTimeKeys } from "@pipeline/Util";

export class Filters {
    channels: ID[];
    authors: Uint8Array;
    startDayIndex: number; // inclusive
    endDayIndex: number; // inclusive
    dayKeys: string[];

    constructor(database: Database) {
        this.channels = [];
        this.authors = new Uint8Array(database.authors.length);
        this.startDayIndex = 0;
        this.endDayIndex = 0;

        // fill date keys
        const { dayKeys } = genTimeKeys(database.time.minDate, database.time.maxDate);
        this.dayKeys = dayKeys;
    }

    hasChannel(channelId: number): boolean {
        // there arent that many channels
        // no need to optimize
        return this.channels.indexOf(channelId) !== -1;
    }
    hasAuthor(authorId: number): boolean {
        return this.authors[authorId] > 0;
    }
    inTime(dayIndex: number): boolean {
        return this.startDayIndex <= dayIndex && dayIndex <= this.endDayIndex;
    }

    updateChannels(channels: ID[]) {
        this.channels = channels;
    }
    updateAuthors(authors: ID[]) {
        this.authors.fill(0);
        for (const authorId of authors) this.authors[authorId] = 1;
    }
    updateStartDate(startDate: DateStr) {
        this.startDayIndex = this.dayKeys.indexOf(startDate);
        console.assert(this.startDayIndex >= 0);
    }
    updateEndDate(endDate: DateStr) {
        this.endDayIndex = this.dayKeys.indexOf(endDate);
        console.assert(this.endDayIndex >= 0);
    }
}
