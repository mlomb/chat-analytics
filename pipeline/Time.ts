// YYYY-MM
export type MonthKey = `${number}-${number}`;
// YYYY-MM-DD
export type DateKey = `${MonthKey}-${number}`;

// I prefer working with [year, month, day] instead of Date objects
// to avoid all kind of problems
export class Day {
    public readonly year: number; // YYYY
    public readonly month: number; // 1-12 !
    public readonly day: number; // 1-31

    constructor(year: number, month: number, day: number) {
        this.year = year;
        this.month = month;
        this.day = day;
    }

    static fromDate(date: Date): Day {
        return new Day(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    static fromKey(key: DateKey): Day {
        const [year, month, day] = key.split("-").map(Number);
        return new Day(year, month, day);
    }

    static fromBinary(binary: number): Day {
        const year = binary >>> 9;
        const month = (binary >>> 5) & 0b1111;
        const day = binary & 0b11111;
        return new Day(year, month, day);
    }

    toDate(): Date {
        return new Date(this.year, this.month - 1, this.day);
    }

    toBinary(): number {
        return (this.year << 9) | (this.month << 5) | this.day;
    }

    get monthKey(): MonthKey {
        return `${this.year}-${this.month}`;
    }

    get dateKey(): DateKey {
        return `${this.monthKey}-${this.day}`;
    }

    nextDay(): Day {
        const d = this.toDate();
        d.setDate(d.getDate() + 1);
        return Day.fromDate(d);
    }

    // equal
    static eq(a: Day, b: Day): boolean {
        return a.year === b.year && a.month === b.month && a.day === b.day;
    }

    // less than
    static lt(a: Day, b: Day): boolean {
        return (
            a.year < b.year ||
            (a.year === b.year && a.month < b.month) ||
            (a.year === b.year && a.month === b.month && a.day < b.day)
        );
    }

    // greater than
    static gt(a: Day, b: Day): boolean {
        return (
            a.year > b.year ||
            (a.year === b.year && a.month > b.month) ||
            (a.year === b.year && a.month === b.month && a.day > b.day)
        );
    }

    // min bettween two days (past)
    static min(a: Day, b: Day): Day {
        return Day.lt(a, b) ? a : b;
    }

    // max bettween two days (future)
    static max(a: Day, b: Day): Day {
        return Day.gt(a, b) ? a : b;
    }

    // clamp day between two days
    static clamp(day: Day, a: Day, b: Day): Day {
        return Day.min(Day.max(day, a), b);
    }
}

export interface TimeKeysResult {
    dateKeys: DateKey[];
    monthKeys: MonthKey[];
    // correspondance between dateKey and monthKeys
    dateToMonthIndex: number[];
}

export const genTimeKeys = (start: Day, end: Day): TimeKeysResult => {
    // check start < end
    console.assert(Day.lt(start, end));

    const onePastEnd = end.nextDay();

    const dateKeys: DateKey[] = [];
    const monthKeys: MonthKey[] = [];
    const dateToMonthIndex: number[] = [];

    let day = start;
    while (!Day.eq(day, onePastEnd)) {
        const dateKey = day.dateKey;
        const monthKey = day.monthKey;

        if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
        dateToMonthIndex.push(monthKeys.length - 1);
        dateKeys.push(dateKey);

        day = day.nextDay();
    }

    return { dateKeys, monthKeys, dateToMonthIndex };
};

export const formatTime = (day: Day, seconds: number): string => {
    const d = day.toDate();
    d.setSeconds(seconds);
    return d.toLocaleString();
};
