import EventEmitter from "events";

import { NewAuthor, NewChannel, NewReport } from "../analyzer/Analyzer";

export type DataPerDate = {
    date: number; // timestamp
    messages: number;
};

export type FrequencyData = {
    value: string;
    count: number;
};

type AttachmentType = "image" | "video" | "voice" | "location" | "file";

export type GeneralStats = {
    totalMessages: number;
    totalWords: number;
    totalLetters: number;
    totalAttachments: {
        [type in AttachmentType]: number;
    };
};

const monthToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1);
const dateToString = (date: Date): string => monthToString(date) + "-" + date.getDate();

// Events:
// updated-zoom: instant (drag time slider)
// updated-data: debounced


export class DataProvider extends EventEmitter {

    // @ts-ignore
    private generalData: GeneralStats;
    //private generalData: GeneralStats;
    private perDay: DataPerDate[] = [];
    private perMonth: DataPerDate[] = [];
    private wordData: FrequencyData[] = [];
    private emojiData: FrequencyData[] = [];

    private activeChannels: NewChannel[] = [];
    private activeAuthors: NewAuthor[] = [];
    private activeStartDate: Date = new Date();
    private activeEndDate: Date = new Date();

    private readonly dates: {
        date: Date;
        dayKey: string;
        monthKey: string;
        dayData: DataPerDate;
        monthData: DataPerDate;
    }[] = [];
    private updateTimer?: NodeJS.Timeout;

    constructor(private readonly source: NewReport) {
        super();

        const monthsData = new Map<string, DataPerDate>();
        const start = new Date(source.minDate);
        const end = new Date(source.maxDate);
        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
            const dayKey = dateToString(day);
            const monthKey = monthToString(day);
            let dayData = {
                date: day.getTime(),
                messages: 0
            };
            let monthData = monthsData.get(monthKey);
            if(monthData === undefined) {
                monthData = {
                    date: new Date(day.getFullYear(), day.getMonth(), 1).getTime(),
                    messages: 0
                };
                monthsData.set(monthKey, monthData);
                this.perMonth.push(monthData);
            }
            this.dates.push({
                date: new Date(day),
                dayKey,
                monthKey,
                dayData,
                monthData
            });
            this.perDay.push(dayData);
        }
        this.activeStartDate = start;
        this.activeEndDate = end;
        this.recomputeData();
    }

    getSource(): NewReport {
        return this.source;
    }

    updateChannels(channels: NewChannel[]) {
        this.activeChannels = channels;
        this.needUpdate();
    }

    updateAuthors(authors: NewAuthor[]) {
        this.activeAuthors = authors;
        this.needUpdate();
    }

    updateTimeRange(start: Date, end: Date) {
        this.activeStartDate = start;
        this.activeEndDate = end;
        this.emit('updated-zoom');
        this.needUpdate();
    }

    update() {
        this.recomputeData();
        console.log("updated-data");
        this.emit('updated-data');
    }

    needUpdate() {
        // debounce
        if(this.updateTimer) {
            // cancel previous timer
            clearTimeout(this.updateTimer);
        }
        this.updateTimer = setTimeout(() => {
            this.updateTimer = undefined;
            this.update();
        }, 2000);
    }

    // TODO: includeInData(author, channel, date), excludeFromData(author, channel, date)
    
    // NOTE: this is expensive, it should be optimized knowing which kind of update it was
    //       (updateChannels, updateAuthors, updateTimeRange)
    recomputeData() {
        console.log("recomputing data");
        let wordsAggr = new Map<string, number>();
        let emojisAggr = new Map<string, number>();

        for (let dayData of this.perDay) dayData.messages = 0;
        for (let monthData of this.perMonth) monthData.messages = 0;

        for (let { dayKey, dayData, monthData } of this.dates) {
            for(const author of this.activeAuthors) {
                for(const channel of this.activeChannels) {
                    if(channel.id in author.channels) {
                        const from_user_in_channel = author.channels[channel.id];
                        if(dayKey in from_user_in_channel) {
                            let messages = from_user_in_channel[dayKey].messages;
                            dayData.messages += messages;
                            monthData.messages += messages;

                            const words = from_user_in_channel[dayKey].words;
                            for(const word in words) {
                                wordsAggr.set(word, (wordsAggr.get(word) || 0) + words[word]);
                            }
                            
                            const emojis = from_user_in_channel[dayKey].emojis;
                            for(const emoji in emojis) {
                                emojisAggr.set(emoji, (emojisAggr.get(emoji) || 0) + emojis[emoji]);
                            }
                        }
                    }
                }
            }
        }

        const deMap = (map: Map<string, number>): FrequencyData[] => {
            let res = [];
            for(const [value, count] of map) {
                res.push({ value, count });
            }
            res.sort((a, b) => b.count - a.count);
            return res.slice(0, 100);
        };

        this.wordData = deMap(wordsAggr);
        this.emojiData = deMap(emojisAggr);
    }

    getPerDayData(): DataPerDate[] {
        return this.perDay;
    }

    getPerMonthData(): DataPerDate[] {
        return this.perMonth;
    }

    getWordsData(): FrequencyData[] {
        return this.wordData;
    }

    getEmojisData(): FrequencyData[] {
        return this.emojiData;
    }

    getStart(): Date {
        return this.activeStartDate;
    }

    getEnd(): Date {
        return this.activeEndDate;
    }
};

export declare var dataProvider: DataProvider;

export const initDataProvider = (source: NewReport) => {
    dataProvider = new DataProvider(source);
};
