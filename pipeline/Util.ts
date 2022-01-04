import { DateStr } from "@pipeline/Types";

export const monthToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1);
export const dateToString = (date: Date): DateStr => monthToString(date) + "-" + date.getDate();
