import Tokenizer from 'wink-tokenizer';

import { Author, Channel, Database, ID, Message } from "./Types";

/*
var sentiment = require('multilang-sentiment');
let str = "test".toLocaleLowerCase();
var tokens = str.split(" ");
var result = sentiment(str, 'en', {
    'tokens': tokens
});
console.dir(result);
*/

type Aggregation = {
    messages: number;
    total_words: number;
    total_emojis: number;
    total_letters: number;
    words: { [word: string]: number };
    emojis: { [emoji: string]: number };
//    by_day: { [day: string]: Aggregation };
};

type ReportData = {
    aggr: Aggregation;
};

type Authors = {
    [id: string]: Author & ReportData;
};

type Channels = {
    [id: string]: {
        name: string;
    } & ReportData;
};

type MessageEvent = {
    type: "message";

};

type DayAggregation = {
    messages: number;
    words: { [word: string]: number };
    emojis: { [emoji: string]: number };
};

type Event = MessageEvent;

export type NewChannel = {
    id: string;
    name: string;
};

export type NewAuthor = {
    id: string;
    name: string;
    channels: {
        [id: string]: {
            [date: string]: DayAggregation;
        };
    }
}

export type NewReport = {
    title: string;
    channels: NewChannel[],
    authors: NewAuthor[]
};

export type Report = {
    title: string;
    channels: Channels;
    authors: Authors;
    // events, stuff
};

const tokenizer = new Tokenizer();

const processMessage = (msg: Message, aggr: DayAggregation) => {
    aggr.messages++;
    
    let tokens = tokenizer.tokenize(msg.content);
    for(let token of tokens) {
        let value = token.value.toLocaleLowerCase();
        switch(token.tag) {
            // "email" | "punctuation" | "number" | "time" | "hashtag" | "mention" | "emoticon" | "ordinal" | "quoted_phrase" | "url" | "symbol" | "currency" | "alien"
            case "word":
                aggr.words[value] = (aggr.words[value] || 0) + 1;
                break;
            case "emoji":
                aggr.emojis[value] = (aggr.emojis[value] || 0) + 1;
                break;
            default:
                // UNHANDLED
                break;
        }
    }
};

const analyze = (db: Database): NewReport => {
    console.log("db", db);

    let authors = new Map<ID, NewAuthor>();
    let channels: NewChannel[] = [];

    for(let [id, author] of db.authors) {
        authors.set(id, {
            id,
            name: author.name,
            channels: { }
        });
    }

    for(let ch of db.channels) {
        channels.push({
            id: ch.id,
            name: ch.name
        });

        for(let msg of ch.messages) {
            let date = `${msg.date.getMonth()+1}-${msg.date.getDate()}-${msg.date.getFullYear()}`;
            let author = authors.get(msg.author)!;
            if(!(ch.id in author.channels)) {
                author.channels[ch.id] = { };
            }
            if(!(date in author.channels[ch.id])) {
                author.channels[ch.id][date] = {
                    messages: 0,
                    words: { },
                    emojis: { }
                };
            }
            let aggr = author.channels[ch.id][date];
            processMessage(msg, aggr);
        }
    }

    let report: NewReport = {
        title: db.title,
        channels,
        authors: Array.from(authors.values())
    };

    console.log(report);

    return report;
};

export { analyze };
