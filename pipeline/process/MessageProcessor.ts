import { Env } from "@pipeline/Env";
import { LanguageCodes, getLanguageIndexByCode } from "@pipeline/Languages";
import { Day } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { PEmoji, PMessage } from "@pipeline/parse/Types";
import { PMessageGroup } from "@pipeline/process/ChannelMessages";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";
import { IndexCountsBuilder } from "@pipeline/process/IndexCounts";
import { Emoji, Message } from "@pipeline/process/Types";
import { Emojis } from "@pipeline/process/nlp/Emojis";
import { FastTextLID176Model } from "@pipeline/process/nlp/FastTextModel";
import { Sentiment } from "@pipeline/process/nlp/Sentiment";
import { matchFormat, normalizeText } from "@pipeline/process/nlp/Text";
import { Token, tokenize } from "@pipeline/process/nlp/Tokenizer";

/**
 * The MessageProcessor takes PMessageGroup's and processes them into the Message's.
 * This class is extremely coupled with the DatabaseBuilder.
 *
 * It does all the necessary analysis.
 */
export class MessageProcessor {
    constructor(private readonly builder: DatabaseBuilder) {}

    // static data
    private emojis?: Emojis;
    private langPredictModel?: FastTextLID176Model;
    private sentiment?: Sentiment;

    // download static data
    async init(env: Env) {
        this.emojis = await Emojis.load(env);
        this.langPredictModel = await FastTextLID176Model.load(env);
        this.sentiment = await Sentiment.load(env, this.emojis);
    }

    processGroupToIntermediate(group: PMessageGroup): Message[] {
        // normalize and tokenize messages
        const tokenizations: Token[][] = group.map((msg) =>
            msg.textContent ? tokenize(normalizeText(msg.textContent)) : []
        );

        // combine text for all the messages in the group
        const allText = tokenizations
            .flat()
            .filter((token) => token.tag === "word")
            .map((token) => token.text)
            .join(" ")
            .toLowerCase();

        // detect language in the whole group text
        // this yields better accuracy
        let langIndex: number | undefined;
        if (allText.length > 0) {
            langIndex = this.langPredictModel!.identifyLanguage(allText).iso639index;
        }

        return group.map((message, index) => this.processMessage(message, tokenizations[index], langIndex));
    }

    /** Process the given message. Also takes the tokens for the message, and other information. */
    private processMessage(msg: PMessage, tokens: Token[], langIndex: number | undefined): Message {
        const wordsCount = new IndexCountsBuilder();
        const emojisCount = new IndexCountsBuilder();
        const mentionsCount = new IndexCountsBuilder();
        const reactionsCount = new IndexCountsBuilder();
        const domainsCount = new IndexCountsBuilder();

        if (msg.reactions) {
            for (const reaction of msg.reactions) {
                reactionsCount.incr(this.processEmoji(reaction[0]), reaction[1]);
            }
        }

        // process tokens
        for (const { tag, text } of tokens) {
            switch (tag) {
                case "word":
                    const wordIdx = this.processWord(text);
                    if (wordIdx) wordsCount.incr(wordIdx);
                    break;
                case "emoji":
                case "custom-emoji":
                    emojisCount.incr(this.processEmoji({ name: text }));
                    break;
                case "mention":
                    mentionsCount.incr(this.processMention(text));
                    break;
                case "url":
                    const domainIdx = this.processURL(text);
                    if (domainIdx) domainsCount.incr(domainIdx);
                    break;
            }
        }

        // sentiment analysis
        let sentiment = 0;
        if (langIndex) {
            sentiment = this.sentiment?.calculate(tokens, langIndex) || 0;
        }

        // TODO: timezones
        const date = new Date(msg.timestamp);
        const day = Day.fromDate(date);

        return {
            dayIndex: day.toBinary(),
            secondOfDay: date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours()),
            authorIndex: this.builder.authors.getIndex(msg.authorId)!,
            replyOffset: msg.replyTo ? 1 : 0, // offset is not really being used right now in the UI
            langIndex,
            sentiment: langIndex !== undefined ? sentiment : undefined,
            words: wordsCount.toArray(),
            emojis: emojisCount.toArray(),
            mentions: mentionsCount.toArray(),
            reactions: reactionsCount.toArray(),
            domains: domainsCount.toArray(),
            attachments: IndexCountsBuilder.fromList(msg.attachments ?? []).toArray(),
        };
    }

    processWord(word: string): Index | undefined {
        const { words } = this.builder;

        const wordKey = matchFormat(word);

        // only keep words between [2, 30] chars
        if (word.length > 1 && word.length <= 30) {
            let wordIdx = words.getIndex(wordKey);
            if (wordIdx === undefined) wordIdx = words.set(wordKey, word);
            return wordIdx;
        }

        return undefined;
    }

    processEmoji(emoji: PEmoji): Index {
        const { emojis } = this.builder;

        const emojiKey = normalizeText(emoji.name).toLowerCase();

        const emojiObj: Emoji = {
            id: emoji.id,
            name: emoji.id ? emoji.name : this.emojis!.getName(emojiKey),
            symbol: emoji.id ? undefined : emojiKey,
        };

        let emojiIdx = emojis.getIndex(emojiKey);
        if (emojiIdx === undefined) {
            emojiIdx = emojis.set(emojiKey, emojiObj);
        } else if (emojis.getByIndex(emojiIdx)!.id === undefined && emoji.id) {
            // ID is new, replace
            emojis.set(emojiKey, emojiObj, 999);
        }
        return emojiIdx;
    }

    processMention(mention: string): Index {
        const { mentions } = this.builder;

        const mentionKey = matchFormat(mention);

        let mentionIdx = mentions.getIndex(mentionKey);
        if (mentionIdx === undefined) mentionIdx = mentions.set(mentionKey, mention);
        return mentionIdx;
    }

    processURL(url: string): Index | undefined {
        const { domains } = this.builder;

        // TODO: transform URL only messages to attachments
        try {
            const hostname = new URL(url).hostname.toLowerCase();

            let domainIdx = domains.getIndex(hostname);
            if (domainIdx === undefined) domainIdx = domains.set(hostname, hostname);
            return domainIdx;
        } catch (ex) {
            return undefined;
        }
    }
}
