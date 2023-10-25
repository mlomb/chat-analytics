const fs = require("fs");

const result = {};

// 1. Parse sentiment data
const emojiSentiment = fs.readFileSync("Emoji_Sentiment_Data_v1.0.csv", "utf8").split("\n").slice(1);
const emojiSentimentMap = {};

for (const line of emojiSentiment) {
    const [emoji, _1, occurrences, _2, negative, neutral, positive] = line.split(",");
    if (occurrences <= 2) continue; // ignore entries with less than 3 occurrences
    const sentiment = positive / occurrences - negative / occurrences;
    if (!isNaN(sentiment)) {
        emojiSentimentMap[emoji] = sentiment.toFixed(3);
    }
}

// 2. Parse emoji data
const emojiTest = fs.readFileSync("emoji-test-14.0.txt", "utf8").split("\n");
// Regex taken from https://github.com/muan/unicode-emoji-json/blob/main/script/build.js
// Check the source above for more information
const EMOJI_REGEX = /^[^#]+;\s(?<type>[\w-]+)\s+#\s(?<emoji>\S+)\sE(?<emojiversion>\d+\.\d)\s(?<desc>.+)/;

const removeModifier = (emoji) => emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/u, "");
const removeVariantForm = (emoji) => emoji.replace(/[\u{FE0F}\u{FE0E}]/u, "");

for (const line of emojiTest) {
    const emojiMatch = line.match(EMOJI_REGEX);
    if (emojiMatch) {
        const {
            groups: { type, emoji, desc },
        } = emojiMatch;
        if (type !== "component") {
            const _emoji = removeVariantForm(emoji);
            result[_emoji] = {
                n: desc.replace(/:/g, ""),
            };

            // check for sentiment data
            const emojiWithoutVariations = removeModifier(_emoji);
            // check for emoji without variations and then with
            if (emojiSentimentMap[emojiWithoutVariations]) {
                result[_emoji].s = emojiSentimentMap[emojiWithoutVariations];
            }
            if (emojiSentimentMap[_emoji]) {
                result[_emoji].s = emojiSentimentMap[_emoji];
            }
        }
    }
}

// {
//     "😀": {
//         "name": "grinning face",
//         "sentiment": 4.3
//     },
//     ...
// }
fs.writeFileSync("emoji-data.json", JSON.stringify(result));
