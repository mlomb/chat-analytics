import { Env } from "@pipeline/Env";
import { LanguageCodes } from "@pipeline/Languages";
import { Day } from "@pipeline/Time";
import { PMessageGroup } from "@pipeline/process/ChannelMessages";
import { DatabaseBuilder } from "@pipeline/process/DatabaseBuilder";
import { IndexCountsBuilder } from "@pipeline/process/IndexCounts";
import { Emoji, Message } from "@pipeline/process/Types";
import { Emojis, EmojisData } from "@pipeline/process/nlp/Emojis";
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
    private stopwords: Set<string> = new Set();
    private langPredictModel: FastTextLID176Model | null = null;
    private emojisData: Emojis | null = null;
    private sentiment: Sentiment | null = null;

    // download static data
    public async init(env: Env) {
        // load stopwords
        {
            interface StopwordsJSON {
                [lang: string]: string[];
            }
            const data = await env.loadAsset<StopwordsJSON>("/data/text/stopwords-iso.json", "json");

            // combining all stopwords is a mistake?
            this.stopwords = new Set(
                Object.values(data)
                    .reduce((acc, val) => acc.concat(val), [])
                    .map((word) => matchFormat(word))
            );
        }

        // load language detector model
        this.langPredictModel = await FastTextLID176Model.load(env);

        // load emoji data
        {
            const data = await env.loadAsset<EmojisData>("/data/emojis/emoji-data.json", "json");
            this.emojisData = new Emojis(data);
        }

        // load sentiment data
        {
            const afinnZipBuffer = await env.loadAsset("/data/text/AFINN.zip", "arraybuffer");
            this.sentiment = new Sentiment(afinnZipBuffer, this.emojisData);
        }
    }

    processGroupToIntermediate(group: PMessageGroup): Message[] {
        const { authors, words, emojis, mentions, domains } = this.builder;

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
        let langIndex: number = 0;
        if (allText.length > 0) {
            const lang = this.langPredictModel!.identifyLanguage(allText);
            langIndex = LanguageCodes.indexOf(lang.iso639);
        }

        let messages: Message[] = [];

        for (let i = 0; i < group.length; i++) {
            const msg = group[i];

            const wordsCount = new IndexCountsBuilder();
            const emojisCount = new IndexCountsBuilder();
            const mentionsCount = new IndexCountsBuilder();
            const reactionsCount = new IndexCountsBuilder();
            const domainsCount = new IndexCountsBuilder();

            if (msg.reactions) {
                for (const reaction of msg.reactions) {
                    const emojiKey = normalizeText(reaction[0].name).toLowerCase();

                    const emojiObj: Emoji = {
                        id: reaction[0].id,
                        name: reaction[0].id ? reaction[0].name : this.emojisData!.getName(emojiKey),
                        symbol: reaction[0].id ? undefined : emojiKey,
                    };

                    let emojiIdx = emojis.getIndex(emojiKey);
                    if (emojiIdx === undefined) {
                        emojiIdx = emojis.set(emojiKey, emojiObj);
                    } else if (emojis.getByIndex(emojiIdx)!.id === undefined && reaction[0].id) {
                        // ID is new, replace
                        emojis.set(emojiKey, emojiObj, 999);
                    }
                    reactionsCount.incr(emojiIdx, reaction[1]);
                }
            }

            // parse tokens
            let sentiment = 0;
            let hasText = false;
            const tokens = tokenizations[i];
            if (tokens.length > 0) {
                // process tokens
                for (const { tag, text } of tokens) {
                    if (tag === "word") {
                        const wordKey = matchFormat(text);
                        // only keep words between [2, 30] chars and no stopwords
                        if (text.length > 1 && text.length <= 30 && !this.stopwords.has(wordKey)) {
                            let wordIdx = words.getIndex(wordKey);
                            if (wordIdx === undefined) wordIdx = words.set(wordKey, text);
                            wordsCount.incr(wordIdx);
                        }
                        hasText = true;
                    } else if (tag === "emoji" || tag === "custom-emoji") {
                        const emojiKey = text.toLowerCase();
                        let emojiIdx = emojis.getIndex(emojiKey);
                        if (emojiIdx === undefined) {
                            const emojiObj: Emoji =
                                tag === "emoji"
                                    ? {
                                          symbol: text,
                                          name: this.emojisData!.getName(text),
                                      }
                                    : {
                                          name: text,
                                      };
                            emojiIdx = emojis.set(emojiKey, emojiObj);
                        }
                        emojisCount.incr(emojiIdx);
                    } else if (tag === "mention") {
                        const mentionKey = matchFormat(text);
                        let mentionIdx = mentions.getIndex(mentionKey);
                        if (mentionIdx === undefined) mentionIdx = mentions.set(mentionKey, text);
                        mentionsCount.incr(mentionIdx);
                    } else if (tag === "url") {
                        // TODO: transform URL only messages to attachments
                        try {
                            const hostname = new URL(text).hostname.toLowerCase();

                            let domainIdx = domains.getIndex(hostname);
                            if (domainIdx === undefined) domainIdx = domains.set(hostname, hostname);

                            domainsCount.incr(domainIdx);
                        } catch (ex) {}
                    }
                }

                // sentiment analysis
                if (hasText) {
                    sentiment = this.sentiment?.get(tokens, langIndex) || 0;
                }
            }

            // TODO: timezones
            const date = new Date(msg.timestamp);
            const day = Day.fromDate(date);

            messages.push({
                dayIndex: day.toBinary(),
                secondOfDay: date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours()),
                authorIndex: authors.getIndex(msg.authorId)!,
                replyOffset: msg.replyTo ? 1 : 0, // offset is not really being used right now in the UI
                langIndex: hasText ? langIndex : undefined,
                sentiment: hasText ? sentiment : undefined,
                words: wordsCount.toArray(),
                emojis: emojisCount.toArray(),
                mentions: mentionsCount.toArray(),
                reactions: reactionsCount.toArray(),
                domains: domainsCount.toArray(),
                attachments: IndexCountsBuilder.fromList(msg.attachments ?? []).toArray(),
            });
        }

        return messages;
    }
}
