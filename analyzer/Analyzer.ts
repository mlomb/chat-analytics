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

type NewAuthor = {
    name: string;
    channels: {
        [id: string]: {
            [date: string]: DayAggregation;
        };
    }
}

export type NewReport = {
    title: string;
    channels: {
        [id: string]: {
            name: string;
        };
    },
    authors: {
        [id: string]: NewAuthor;
    };
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

    let authors: { [id: string]: NewAuthor } = {};
    let channels: { [id: string]: { name: string } } = {};

    for(let [id, author] of db.authors) {
        authors[id] = {
            name: author.name,
            channels: { }
        };
    }

    for(let ch of db.channels) {
        channels[ch.id] = { name: ch.name };

        for(let msg of ch.messages) {
            let date = `${msg.date.getMonth()+1}-${msg.date.getDate()}-${msg.date.getFullYear()}`;
            let author = authors[msg.author];
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

    let report = {
        title: db.title,
        channels,
        authors,
    };

    console.log(report);

    return report;
};

export { analyze };
