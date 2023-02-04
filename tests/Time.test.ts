import { DateKey, Day, MonthKey, WeekKey, YearKey, formatTime, genTimeKeys } from "@pipeline/Time";

it("should convert from and to Date", () => {
    const date = new Date(2020, 5, 7);
    const day = Day.fromDate(date);
    expect(day.year).toBe(2020);
    expect(day.month).toBe(5 + 1);
    expect(day.day).toBe(7);
    expect(day.toDate().getTime()).toBe(date.getTime());
    expect(day.toTimestamp()).toBe(date.getTime());
});

it("should convert from and to binary", () => {
    const day = Day.fromKey("2020-6-7");
    const binary = day.toBinary();
    const back = Day.fromBinary(binary);
    expect(back.year).toBe(2020);
    expect(back.month).toBe(6);
    expect(back.day).toBe(7);
});

describe("can be created from keys", () => {
    // prettier-ignore
    const cases: {
        key: DateKey | WeekKey | MonthKey | YearKey;
        year: number;
        month: number;
        day: number;
    }[] = [
        { key: "2020-6-7",  year: 2020, month: 6, day: 7 },
        { key: "2020-6",    year: 2020, month: 6, day: 1 },
        { key: "2020",      year: 2020, month: 1, day: 1 },
        { key: "2020-6--3", year: 2020, month: 6, day: 22 },
    ];

    test.each(cases)("can be created from key: $key", ({ key, year, month, day }) => {
        const d = Day.fromKey(key);
        expect(d.year).toBe(year);
        expect(d.month).toBe(month);
        expect(d.day).toBe(day);

        expect(d.yearKey).toBe(`${year}`);
        expect(d.monthKey).toBe(`${year}-${month}`);
        expect(d.weekKey).toBe(`${year}-${month}--${Math.floor((day - 1) / 7)}`);
        expect(d.dateKey).toBe(`${year}-${month}-${day}`);
    });
});

it("should advance one day", () => {
    const day = Day.fromKey("2020-6-30");
    const day1 = day.nextDay();
    expect(day1.year).toBe(2020);
    expect(day1.month).toBe(7);
    expect(day1.day).toBe(1);
});

it("should advance multiple days", () => {
    const day = Day.fromKey("2020-6-29");
    const day3 = day.nextDays(3);
    expect(day3.year).toBe(2020);
    expect(day3.month).toBe(7);
    expect(day3.day).toBe(2);
});

describe("operators", () => {
    const first = Day.fromKey("2020-6-29");
    const days = new Array(60).fill(0).map((_, i) => first.nextDays(10 * i));

    test("operator eq", () => {
        for (let i = 0; i < days.length; i++) {
            for (let j = 0; j < days.length; j++) {
                expect(Day.eq(days[i], days[j])).toBe(i === j);
            }
        }
    });

    test("operator lt", () => {
        for (let i = 0; i < days.length; i++) {
            for (let j = 0; j < days.length; j++) {
                expect(Day.lt(days[i], days[j])).toBe(i < j);
            }
        }
    });

    test("operator gt", () => {
        for (let i = 0; i < days.length; i++) {
            for (let j = 0; j < days.length; j++) {
                expect(Day.gt(days[i], days[j])).toBe(i > j);
            }
        }
    });

    test("operator min", () => {
        expect(Day.min(days[0], days[1])).toBe(days[0]);
        expect(Day.min(days[1], days[0])).toBe(days[0]);
    });

    test("operator max", () => {
        expect(Day.max(days[0], days[1])).toBe(days[1]);
        expect(Day.max(days[1], days[0])).toBe(days[1]);
    });

    test("operator clamp", () => {
        expect(Day.clamp(days[5], days[10], days[20])).toBe(days[10]);
        expect(Day.clamp(days[15], days[10], days[20])).toBe(days[15]);
        expect(Day.clamp(days[25], days[10], days[20])).toBe(days[20]);
    });
});

test("genTimeKeys should generate keys correctly", () => {
    const { dateKeys, weekKeys, monthKeys, yearKeys, dateToMonthIndex, dateToWeekIndex, dateToYearIndex } = genTimeKeys(
        Day.fromKey("2020-12-25"),
        Day.fromKey("2021-1-5")
    );

    expect(dateKeys).toEqual([
        "2020-12-25",
        "2020-12-26",
        "2020-12-27",
        "2020-12-28",
        "2020-12-29",
        "2020-12-30",
        "2020-12-31",
        "2021-1-1",
        "2021-1-2",
        "2021-1-3",
        "2021-1-4",
        "2021-1-5",
    ]);
    expect(weekKeys).toEqual(["2020-12--3", "2020-12--4", "2021-1--0"]);
    expect(monthKeys).toEqual(["2020-12", "2021-1"]);
    expect(yearKeys).toEqual(["2020", "2021"]);

    expect(dateToMonthIndex).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
    expect(dateToWeekIndex).toEqual([0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2]);
    expect(dateToYearIndex).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
});

test("genTimeKeys should throw if start > end", () => {
    expect(() => genTimeKeys(Day.fromKey("2021-1-5"), Day.fromKey("2020-12-25"))).toThrow();
});
