import { Database, ID } from "@pipeline/Types";
import { DateKey, Day, genTimeKeys } from "@pipeline/Time";

export class Filters {
    channels: ID[];
    authors: Uint8Array;
    startDayIndex: number; // inclusive
    endDayIndex: number; // inclusive
    dateKeys: DateKey[];

    constructor(database: Database) {
        this.channels = [];
        this.authors = new Uint8Array(database.authors.length);
        this.startDayIndex = 0;
        this.endDayIndex = 0;

        // fill date keys
        const { dateKeys } = genTimeKeys(Day.fromKey(database.time.minDate), Day.fromKey(database.time.maxDate));
        this.dateKeys = dateKeys;
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

    get numActiveDays(): number {
        return this.endDayIndex - this.startDayIndex + 1;
    }

    updateChannels(channels: ID[]) {
        this.channels = channels;
    }
    updateAuthors(authors: ID[]) {
        this.authors.fill(0);
        for (const authorId of authors) this.authors[authorId] = 1;
    }
    updateStartDate(startDate: DateKey) {
        this.startDayIndex = this.dateKeys.indexOf(startDate);
        console.assert(this.startDayIndex >= 0);
    }
    updateEndDate(endDate: DateKey) {
        this.endDayIndex = this.dateKeys.indexOf(endDate);
        console.assert(this.endDayIndex >= 0);
    }
}
