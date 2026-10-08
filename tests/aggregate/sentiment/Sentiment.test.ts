import { computeCommonBlockData } from "@pipeline/aggregate/Common";
import { Filters } from "@pipeline/aggregate/Filters";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import SentimentPerPeriod from "@pipeline/aggregate/blocks/sentiment/SentimentPerPeriod";
import SentimentStats from "@pipeline/aggregate/blocks/sentiment/SentimentStats";
import { Database } from "@pipeline/process/Types";
import { MessageView } from "@pipeline/serialization/MessageView";

jest.mock("@pipeline/aggregate/Helpers", () => ({ filterMessages: jest.fn() }));

const db = {} as Database;
const filters = {} as Filters;
const common = {
    keyToTimestamp: { month: [0], week: [0] },
    timeKeys: { dateToMonthIndex: [0], dateToWeekIndex: [0] },
} as unknown as ReturnType<typeof computeCommonBlockData>;
const mockFilter = filterMessages as jest.Mock;

const messages = (scores: (number | undefined)[]) => {
    mockFilter.mockImplementation((fn: (msg: MessageView) => void) => {
        scores.forEach((sentiment) => fn({ sentiment, dayIndex: 0 } as MessageView));
    });
};

it("counts unscored messages separately from balanced scores", () => {
    messages([3, -2, 0, undefined, undefined]);
    expect(SentimentStats.fn(db, filters, common, undefined)).toEqual({
        totalMessages: 5,
        positiveMessages: 1,
        negativeMessages: 1,
        neutralMessages: 1,
        unscoredMessages: 2,
    });
});

it("uses all messages as the percentage denominator in every period", () => {
    messages([3, -2, 0, undefined, undefined]);
    const result = SentimentPerPeriod.fn(db, filters, common, undefined);
    expect(result.unscoredMessages).toBe(2);
    for (const period of [result.perMonth[0], result.perWeek[0]]) {
        expect(period).toMatchObject({ p: 1, n: -1, z: 1, u: 2, percP: 20, percN: -20 });
    }
});

it("handles empty and entirely unscored periods without invalid percentages", () => {
    for (const scores of [[], [undefined, undefined]]) {
        messages(scores);
        const stats = SentimentStats.fn(db, filters, common, undefined);
        expect(stats.totalMessages).toBe(scores.length);
        expect(stats.unscoredMessages).toBe(scores.length);
        const result = SentimentPerPeriod.fn(db, filters, common, undefined);
        expect(result.perMonth[0]).toMatchObject({ percP: 0, percN: 0, u: scores.length });
        expect(result.perWeek[0]).toMatchObject({ percP: 0, percN: 0, u: scores.length });
    }
});
