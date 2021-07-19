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
    by_day: { [day: string]: Aggregation };
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

export type Report = {
    channels: Channels;
    authors: Authors;
    // events, stuff
};

const tokenizer = new Tokenizer();

const processMessage = (msg: Message, aggrs: Aggregation[]) => {
    /*
    const graphemes = splitter.iterateGraphemes(msg.content);

    const processWord = (word: string) => {
        if(word.length === 0) return;

        for(let aggr of aggrs) {
            aggr.words[word] = (aggr.words[word] || 0) + 1;
            aggr.total_words++;
        }
    };

    let word = "";
    for (const grapheme of graphemes) {
        if(WORD_BREAKS.includes(grapheme)) {
            processWord(word);
            word = "";
        } else {
            const isEmoji = false;
            if(!isEmoji) {
                word += grapheme.toLocaleLowerCase();
            }
            for(let aggr of aggrs) {
                aggr.total_graphemes++;
                if(isEmoji) {
                }
            }
        }
    }
    processWord(word);
    
    console.log(tokenizer.tokenize(msg.content));
    */
    for(let aggr of aggrs) { aggr.messages++; }

    let tokens = tokenizer.tokenize(msg.content);
    for(let token of tokens) {
        let value = token.value.toLocaleLowerCase();
        switch(token.tag) {
            // "email" | "punctuation" | "number" | "time" | "hashtag" | "mention" | "emoticon" | "ordinal" | "quoted_phrase" | "url" | "symbol" | "currency" | "alien"
            case "word":
                for(let aggr of aggrs) {
                    aggr.total_letters += value.length;
                    aggr.total_words++;
                    aggr.words[value] = (aggr.words[value] || 0) + 1;
                }
                break;
            case "emoji":
                for(let aggr of aggrs) {
                    aggr.total_emojis++;
                    aggr.emojis[value] = (aggr.emojis[value] || 0) + 1;
                }
                break;
            default:
                // UNHANDLED
                break;
        }
    }
};

const analyze = (db: Database): Report => {
    console.log("db", db);

    let authors: Authors = {};
    let channels: Channels = {};

    for(let ch of db.channels) {
        channels[ch.id] = {
            name: ch.name,
            aggr: {
                messages: 0,
                total_words: 0,
                total_emojis: 0,
                total_letters: 0,
                words: { },
                emojis: { }
            }
        };
        let channel = channels[ch.id];
        for(let msg of ch.messages) {
            if(!(msg.author in authors)) {
                // @ts-ignore
                authors[msg.author] = {
                    ...db.authors.get(msg.author),
                    aggr: {
                        messages: 0,
                        total_words: 0,
                        total_emojis: 0,
                        total_letters: 0,
                        words: { },
                        emojis: { }
                    }
                };
            }

            let author = authors[msg.author];
            processMessage(msg, [author.aggr, channel.aggr]);
        }
    }

    let report = {
        channels,
        authors
    };

    console.log(report);
    return report;
};

export { analyze };
