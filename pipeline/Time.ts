// YYYY-MM
export type MonthKey = `${number}-${number}`;
// YYYY-MM-DD
export type DateKey = `${MonthKey}-${number}`;
// YYYY-MM--W (0-3, aligned to month)
export type WeekKey = `${MonthKey}--${number}`;

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

    static fromKey(key: DateKey | MonthKey | WeekKey): Day {
        const arr = key.split("-").map(Number);
        if (arr.length === 2) {
            return new Day(arr[0], arr[1], 1);
        } else if (arr.length === 3) {
            return new Day(arr[0], arr[1], arr[2]);
        } else {
            return new Day(arr[0], arr[1], arr[3] * 7 + 1);
        }
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

    toTimestamp(): number {
        return this.toDate().getTime();
    }

    toBinary(): number {
        return (this.year << 9) | (this.month << 5) | this.day;
    }

    get monthKey(): MonthKey {
        return `${this.year}-${this.month}`;
    }

    get weekKey(): WeekKey {
        const week = Math.floor((this.day - 1) / 7);
        return `${this.year}-${this.month}--${week}`;
    }

    get dateKey(): DateKey {
        return `${this.monthKey}-${this.day}`;
    }

    nextDays(days: number): Day {
        const d = this.toDate();
        d.setDate(d.getDate() + days);
        return Day.fromDate(d);
    }

    nextDay(): Day {
        return this.nextDays(1);
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
    weekKeys: WeekKey[];
    monthKeys: MonthKey[];
    // correspondance between dateKey and weekKeys/monthKeys
    dateToWeekIndex: number[];
    dateToMonthIndex: number[];
}

export const genTimeKeys = (start: Day, end: Day): TimeKeysResult => {
    // check start < end
    console.assert(Day.lt(start, end));

    const onePastEnd = end.nextDay();

    const dateKeys: DateKey[] = [];
    const weekKeys: WeekKey[] = [];
    const monthKeys: MonthKey[] = [];
    const dateToWeekIndex: number[] = [];
    const dateToMonthIndex: number[] = [];

    let day = start;
    while (!Day.eq(day, onePastEnd)) {
        const dateKey = day.dateKey;
        const monthKey = day.monthKey;
        const weekKey = day.weekKey;

        if (weekKeys.length === 0 || weekKeys[weekKeys.length - 1] !== weekKey) weekKeys.push(weekKey);
        if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
        dateKeys.push(dateKey);
        dateToWeekIndex.push(weekKeys.length - 1);
        dateToMonthIndex.push(monthKeys.length - 1);

        day = day.nextDay();
    }

    return { dateKeys, monthKeys, weekKeys, dateToMonthIndex, dateToWeekIndex };
};

export const formatTime = (
    day: Day,
    seconds: number,
    options = {
        showDate: true, // day, month, year
        showTime: true, // hour, minute, second
        hideSeconds: true, // if true, removes seconds from showTime
    }
): string => {
    const d = day.toDate();
    d.setSeconds(seconds);
    let str = "";
    if (options.showDate && options.showTime) {
        str = d.toLocaleString();
    } else if (options.showDate) {
        str = d.toLocaleDateString();
    } else if (options.showTime) {
        str = d.toLocaleTimeString();
    }
    if (options.showTime && options.hideSeconds) {
        str = str.slice(0, -3);
    }
    return str;
};
