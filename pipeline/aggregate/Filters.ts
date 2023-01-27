import { DateKey, Day, genTimeKeys } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { Database } from "@pipeline/process/Types";

export class Filters {
    channels: Index[];
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

    hasChannel(channelIndex: number): boolean {
        // there aren't that many channels
        // no need to optimize
        return this.channels.indexOf(channelIndex) !== -1;
    }
    hasAuthor(authorIndex: number): boolean {
        return this.authors[authorIndex] > 0;
    }
    inTime(dayIndex: number): boolean {
        return this.startDayIndex <= dayIndex && dayIndex <= this.endDayIndex;
    }

    get numActiveDays(): number {
        return this.endDayIndex - this.startDayIndex + 1;
    }

    updateChannels(channels: Index[]) {
        this.channels = channels;
    }
    updateAuthors(authors: Index[]) {
        this.authors.fill(0);
        for (const authorIndex of authors) this.authors[authorIndex] = 1;
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
