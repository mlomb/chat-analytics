import EventEmitter from "events";

import { NewAuthor, NewChannel, NewReport } from "../analyzer/Analyzer";

export type DataPerDay = {
    date: Date;
    messages: number;
};

export type WordData = {
    word: string;
    count: number;
};

const dateToString = (date: Date): string => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

// Events:
// updated-zoom: instant (drag time slider)
// updated-data: debounced


export class DataProvider extends EventEmitter {

    private perDay: DataPerDay[] = [];
    private wordData: WordData[] = [];

    private activeChannels: NewChannel[] = [];
    private activeAuthors: NewAuthor[] = [];
    private activeStartDate: Date = new Date();
    private activeEndDate: Date = new Date();

    private readonly dates: [Date, string][] = [];
    private updateTimer?: NodeJS.Timeout;

    constructor(private readonly source: NewReport) {
        super();

        this.perDay = [];
        const start = new Date(source.minDate);
        const end = new Date(source.maxDate);
        for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
            this.dates.push([new Date(day), dateToString(day)]);
            this.perDay.push({
                date: new Date(day),
                messages: 0
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
        for (let [date, dateStr] of this.dates) {
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
                        }
                    }
                }
            }
            this.perDay[i++].messages = messages;
        }

        this.wordData = [];
        for(const [word, count] of wordsAggr) {
            this.wordData.push({ word, count });
        }
        this.wordData.sort((a, b) => b.count - a.count);
        this.wordData = this.wordData.slice(0, 100);
    }

    getPerDayData(): DataPerDay[] {
        return this.perDay;
    }

    getWordsData(): WordData[] {
        return this.wordData;
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
