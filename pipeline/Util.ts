import { DateStr, Timestamp } from "@pipeline/Types";

export const monthToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1);
export const dateToString = (date: Date): DateStr => monthToString(date) + "-" + date.getDate();

export const normalizeDate = (date: Date): Date => {
    // TODO: think how to do this correctly
    const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return new Date(utc);
};

export const genTimeKeys = (
    from: Timestamp | DateStr | Date,
    to: Timestamp | DateStr | Date
): {
    dayKeys: DateStr[];
    monthKeys: DateStr[];
} => {
    const start = normalizeDate(new Date(from));
    const end = normalizeDate(new Date(to));
    // advance so end is included (<= does not work)
    // TODO: check why it works with 2 and not with 1
    end.setDate(end.getDate() + 2);

    const dayKeys: string[] = [];
    const monthKeys: string[] = [];

    for (let day = start; day < end; day.setDate(day.getDate() + 1)) {
        const dayKey = dateToString(day);
        const monthKey = monthToString(day);

        dayKeys.push(dayKey);
        if (monthKeys.length === 0 || monthKeys[monthKeys.length - 1] !== monthKey) monthKeys.push(monthKey);
    }

    return { dayKeys, monthKeys };
};
