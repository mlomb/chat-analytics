import { Env } from "@pipeline/Env";
import { LanguageCodes } from "@pipeline/Languages";
import { Day } from "@pipeline/Time";
import { Index, RawID } from "@pipeline/Types";
import { PAuthor, PMessage } from "@pipeline/parse/Types";
import { PMessageGroup } from "@pipeline/process/ChannelMessages";
import { IndexCounts, IndexCountsBuilder } from "@pipeline/process/IndexCounts";
import { IndexedMap } from "@pipeline/process/IndexedMap";
import { Emoji, IMessage } from "@pipeline/process/Types";
import { Emojis, EmojisData } from "@pipeline/process/nlp/Emojis";
import { FastTextLID176Model, FastTextModel } from "@pipeline/process/nlp/FastTextModel";
import { Sentiment } from "@pipeline/process/nlp/Sentiment";
import { matchFormat, normalizeText } from "@pipeline/process/nlp/Text";
import { Token, tokenize } from "@pipeline/process/nlp/Tokenizer";

/**
 * The MessageProcessor takes PMessageGroup's and processes them into the IMessage's (intermediate messages)
 *
 * It does all the necessary analysis.
 *
 * TODO: NEEDS REFACTORING
 */
export class MessageProcessor {
    constructor(private readonly authors: IndexedMap<RawID, PAuthor>) {}

    words = new IndexedMap<string, string>();
    emojis = new IndexedMap<string, Emoji>();
    mentions = new IndexedMap<string, string>();
    domains = new IndexedMap<string, string>();

    minDate: Day | undefined;
    maxDate: Day | undefined;

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

    processGroupToIntermediate(group: PMessageGroup): IMessage[] {
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

        let messages: IMessage[] = [];

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

                    let emojiIdx = this.emojis.getIndex(emojiKey);
                    if (emojiIdx === undefined) {
                        emojiIdx = this.emojis.set(emojiKey, emojiObj);
                    } else if (this.emojis.getByIndex(emojiIdx)!.id === undefined && reaction[0].id) {
                        // ID is new, replace
                        this.emojis.set(emojiKey, emojiObj, 999);
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
                            let wordIdx = this.words.getIndex(wordKey);
                            if (wordIdx === undefined) wordIdx = this.words.set(wordKey, text);
                            wordsCount.incr(wordIdx);
                        }
                        hasText = true;
                    } else if (tag === "emoji" || tag === "custom-emoji") {
                        const emojiKey = text.toLowerCase();
                        let emojiIdx = this.emojis.getIndex(emojiKey);
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
                            emojiIdx = this.emojis.set(emojiKey, emojiObj);
                        }
                        emojisCount.incr(emojiIdx);
                    } else if (tag === "mention") {
                        const mentionKey = matchFormat(text);
                        let mentionIdx = this.mentions.getIndex(mentionKey);
                        if (mentionIdx === undefined) mentionIdx = this.mentions.set(mentionKey, text);
                        mentionsCount.incr(mentionIdx);
                    } else if (tag === "url") {
                        // TODO: transform URL only messages to attachments
                        try {
                            const hostname = new URL(text).hostname.toLowerCase();

                            let domainIdx = this.domains.getIndex(hostname);
                            if (domainIdx === undefined) domainIdx = this.domains.set(hostname, hostname);

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
            if (this.minDate === undefined || Day.lt(day, this.minDate)) this.minDate = day;
            if (this.maxDate === undefined || Day.gt(day, this.maxDate)) this.maxDate = day;

            messages.push({
                day: day.toBinary(),
                secondOfDay: date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours()),
                authorIndex: this.authors.getIndex(msg.authorId)!,
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
