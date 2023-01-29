import { Env } from "@pipeline/Env";
import { LanguageCodes } from "@pipeline/Languages";
import { Day } from "@pipeline/Time";
import { Index, RawID } from "@pipeline/Types";
import { PAuthor } from "@pipeline/parse/Types";
import { PMessageGroup } from "@pipeline/process/ChannelMessages";
import { IndexedMap } from "@pipeline/process/IndexedMap";
import { Emoji, IMessage } from "@pipeline/process/Types";
import { Emojis, EmojisData } from "@pipeline/process/nlp/Emojis";
import { FastTextModel, loadFastTextModel } from "@pipeline/process/nlp/FastTextModel";
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

    // keep track of some counts
    private wordsCount: number[] = [];
    private languagesCount: { [lang: number]: number } = {};

    // static data
    private stopwords: Set<string> = new Set();
    private langPredictModel: FastTextModel | null = null;
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
        this.langPredictModel = await loadFastTextModel("lid.176", env);

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

    process(group: PMessageGroup): IMessage[] {
        // normalize and tokenize messages
        const tokenizations: Token[][] = [];
        for (const msg of group) {
            if (msg.textContent && msg.textContent.length > 0) {
                tokenizations.push(tokenize(normalizeText(msg.textContent)));
            } else {
                tokenizations.push([]);
            }
        }

        // detect language in the whole group
        let langIndex: number = 0;
        const combined: string[] = [];
        for (const tokens of tokenizations) {
            for (const token of tokens) {
                // only keep words
                if (token.tag === "word") combined.push(token.text.toLowerCase());
            }
        }
        if (combined.length > 0) {
            const combinedWords = combined.join(" ");
            const prediction = this.detectLanguageLine(combinedWords);
            langIndex = prediction.index;
            this.languagesCount[langIndex] = (this.languagesCount[langIndex] || 0) + 1;
        }

        interface Counts {
            [idx: number]: number;
        }
        const countsToArray = (counts: Counts): [Index, number][] => {
            const res: [Index, number][] = [];
            for (const [idx, count] of Object.entries(counts)) {
                res.push([parseInt(idx), count]);
            }
            return res;
        };

        let messages: IMessage[] = [];

        for (let i = 0; i < group.length; i++) {
            const msg = group[i];

            const wordsCount: Counts = {};
            const emojisCount: Counts = {};
            const mentionsCount: Counts = {};
            const reactionsCount: Counts = {};
            const domainsCount: Counts = {};

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
                    reactionsCount[emojiIdx] = (reactionsCount[emojiIdx] || 0) + reaction[1];
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
                            wordsCount[wordIdx] = (wordsCount[wordIdx] || 0) + 1;
                            this.wordsCount[wordIdx] = (this.wordsCount[wordIdx] || 0) + 1;
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
                        emojisCount[emojiIdx] = (emojisCount[emojiIdx] || 0) + 1;
                    } else if (tag === "mention") {
                        const mentionKey = matchFormat(text);
                        let mentionIdx = this.mentions.getIndex(mentionKey);
                        if (mentionIdx === undefined) mentionIdx = this.mentions.set(mentionKey, text);
                        mentionsCount[mentionIdx] = (mentionsCount[mentionIdx] || 0) + 1;
                    } else if (tag === "url") {
                        // TODO: transform URL only messages to attachments
                        try {
                            const hostname = new URL(text).hostname.toLowerCase();

                            let domainIdx = this.domains.getIndex(hostname);
                            if (domainIdx === undefined) domainIdx = this.domains.set(hostname, hostname);

                            domainsCount[domainIdx] = (domainsCount[domainIdx] || 0) + 1;
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
                authorIndex: 0, // msg.authorIndex,
                replyOffset: msg.replyTo ? 1 : 0, // offset is not really being used right now in the UI
                langIndex: hasText ? langIndex : undefined,
                sentiment: hasText ? sentiment : undefined,
                words: countsToArray(wordsCount),
                emojis: countsToArray(emojisCount),
                mentions: countsToArray(mentionsCount),
                reactions: countsToArray(reactionsCount),
                domains: countsToArray(domainsCount),
                // TODO: should be combined
                attachments: msg.attachments?.map((a) => [a, 1]),
            });
        }

        return messages;
    }

    // NOTE: assumes the word is normalized and contains no newlines
    private detectLanguageLine(line: string) {
        const result = this.langPredictModel!.predict(line, 1, 0.0);
        const code = result[0][1].slice(9); // "__label__".length === 9
        return {
            accuracy: result[0][0],
            // ISO 639-2/3
            iso639: code,
            index: LanguageCodes.indexOf(code),
        };
    }
}
