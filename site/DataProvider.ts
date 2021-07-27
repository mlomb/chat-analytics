import EventEmitter from "events";

import { NewAuthor, NewChannel, NewReport } from "../analyzer/Analyzer";

export type DataPerDate = {
    date: Date;
    messages: number;
};

export type FrequencyData = {
    value: string;
    count: number;
};

const dateToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

// Events:
// updated-zoom: instant (drag time slider)
// updated-data: debounced


export class DataProvider extends EventEmitter {

    private perDay: DataPerDate[] = [];
    private perMonth: DataPerDate[] = [];
    private wordData: FrequencyData[] = [];
    private emojiData: FrequencyData[] = [];

    private activeChannels: NewChannel[] = [];
    private activeAuthors: NewAuthor[] = [];
    private activeStartDate: Date = new Date();
    private activeEndDate: Date = new Date();

    private readonly dates: string[] = [];
    private updateTimer?: NodeJS.Timeout;

    constructor(private readonly source: NewReport) {
        super();

        const start = new Date(source.minDate);
        const end = new Date(source.maxDate);
        for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
            this.dates.push(dateToString(day));
            this.perDay.push({
                date: new Date(day),
                messages: 0
            });
        }
        for (let month = new Date(start); month <= end; month.setMonth(month.getMonth() + 1)) {
            this.perMonth.push({
                date: new Date(month),
                messages: Math.random() * 1000 + 10
            });
        }
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
        }, 200);
    }

    // TODO: includeInData(author, channel, date), excludeFromData(author, channel, date)
    
    // NOTE: this is expensive, it should be optimized knowing which kind of update it was
    //       (updateChannels, updateAuthors, updateTimeRange)
    recomputeData() {
        let i = 0;
        let wordsAggr = new Map<string, number>();
        let emojisAggr = new Map<string, number>();

        for (let dateStr of this.dates) {
            let messages = 0;
            
            for(const author of this.activeAuthors) {
                for(const channel of this.activeChannels) {
                    if(channel.id in author.channels) {
                        const from_user_in_channel = author.channels[channel.id];
                        if(dateStr in from_user_in_channel) {
                            messages += from_user_in_channel[dateStr].messages;

                            const words = from_user_in_channel[dateStr].words;
                            for(const word in words) {
                                wordsAggr.set(word, (wordsAggr.get(word) || 0) + words[word]);
                            }
                            
                            const emojis = from_user_in_channel[dateStr].emojis;
                            for(const emoji in emojis) {
                                emojisAggr.set(emoji, (emojisAggr.get(emoji) || 0) + emojis[emoji]);
                            }
                        }
                    }
                }
            }
            this.perDay[i++].messages = messages;
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
