import { DateArr, DateStr } from "@pipeline/Types";

export const toDateArr = (date: Date): DateArr => [date.getFullYear(), date.getMonth() + 1, date.getDate()];
export const fromDateArr = (dateArr: DateArr): Date => new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
export const eqDateArr = (a: DateArr, b: DateArr): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
export const ltDateArr = (a: DateArr, b: DateArr): boolean =>
    a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) || (a[0] === b[0] && a[1] === b[1] && a[2] < b[2]);
export const gtDateArr = (a: DateArr, b: DateArr): boolean =>
    a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]) || (a[0] === b[0] && a[1] === b[1] && a[2] > b[2]);
export const maxDateArr = (a: DateArr, b: DateArr) => (gtDateArr(a, b) ? a : b);
export const minDateArr = (a: DateArr, b: DateArr) => (ltDateArr(a, b) ? a : b);
export const nextDateArr = (date: DateArr): DateArr => {
    const d = fromDateArr(date);
    d.setDate(d.getDate() + 1);
    return toDateArr(d);
};
export const monthToString = (date: DateArr): string => date[0] + "-" + date[1];
export const dateToString = (date: DateArr): DateStr => monthToString(date) + "-" + date[2];

export const genTimeKeys = (
    start: DateArr,
    end: DateArr
): {
    dayKeys: DateStr[];
    monthKeys: DateStr[];
    dayToMonthIndex: number[];
} => {
    const onePastEnd = nextDateArr(end);

    const dayKeys: DateStr[] = [];
    const monthKeys: DateStr[] = [];
    const dayToMonthIndex: number[] = [];

    let day = start;
    while (!eqDateArr(day, onePastEnd)) {
        const dayKey = dateToString(day);
        const monthKey = monthToString(day);

        if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
        dayToMonthIndex.push(monthKeys.length - 1);
        dayKeys.push(dayKey);

        day = nextDateArr(day);
    }

    return { dayKeys, monthKeys, dayToMonthIndex };
};
