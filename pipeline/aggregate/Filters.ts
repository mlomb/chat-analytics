import { DateKey, Day, genTimeKeys } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { Database } from "@pipeline/process/Types";

/**
 * Keeps the state of the currently applied filters in the UI.
 * Stores the selected time range and the index of the selected channels & authors.
 *
 * Can be updated and queried.
 */
export class Filters {
    private channels: Index[];
    private authors: Uint8Array; // Index[], stored as TypedArray for performance

    // [startDayIndex, endDayIndex]
    // they index DateKey[]
    private startDayIndex: number;
    private endDayIndex: number;
    private dateKeys: DateKey[];

    constructor(database: Database) {
        this.channels = [];
        this.authors = new Uint8Array(database.authors.length);
        this.startDayIndex = 0;
        this.endDayIndex = 0;

        // fill date keys
        this.dateKeys = genTimeKeys(Day.fromKey(database.time.minDate), Day.fromKey(database.time.maxDate)).dateKeys;
    }

    /** Updates the indexes of the selected channels */
    updateChannels(channels: Index[]) {
        this.channels = channels;
    }

    /** Updates the indexes of the selected authors */
    updateAuthors(authors: Index[]) {
        this.authors.fill(0);
        for (const authorIndex of authors) this.authors[authorIndex] = 1;
    }

    /** Updates the start date of the selected time range */
    updateStartDate(startDate: DateKey) {
        this.startDayIndex = this.dateKeys.indexOf(startDate);
    }

    /** Updates the end date of the selected time range */
    updateEndDate(endDate: DateKey) {
        this.endDayIndex = this.dateKeys.indexOf(endDate);
    }

    /** @returns true if the channel is currently selected */
    hasChannel(channelIndex: number): boolean {
        // there aren't that many channels
        // no need to optimize
        return this.channels.indexOf(channelIndex) !== -1;
    }

    /** @returns true if the author is currently selected */
    hasAuthor(authorIndex: number): boolean {
        return this.authors[authorIndex] > 0;
    }

    /** @returns true if the day is inside the selected time range */
    inTime(dayIndex: number): boolean {
        return this.startDayIndex <= dayIndex && dayIndex <= this.endDayIndex;
    }

    /** @returns the number of days that are currently selected */
    get numActiveDays(): number {
        return this.endDayIndex - this.startDayIndex + 1;
    }
}
