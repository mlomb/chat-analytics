const whitespaceRegex = /\s\s+/g;
const emojiVariantFormRegex = /[\u{FE0F}\u{FE0E}]/gu;

/** Normalizes the text using `NFKC` and removes other unwanted characters */
export const normalizeText = (text: string) =>
    text
        // normalize the content using NFKC (we want the compositions)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
        .normalize("NFKC")
        // change all whitespace to one space (important for the lang detector, newlines bad)
        .replace(whitespaceRegex, " ")
        // remove variant forms from emojis
        // U+FE0E → text variant
        // U+FE0F → graphics variant (colors)
        // See: https://stackoverflow.com/questions/38100329/what-does-u-ufe0f-in-an-emoji-mean-is-it-the-same-if-i-delete-it
        .replace(emojiVariantFormRegex, "")
        // trim
        .trim();

/**
 * Mapping between diacritics/symbols and their base characters
 *
 * Initial list taken from: https://github.com/JedWatson/react-select/blob/c350a124f8de853a79e0158578d438a35e67e63e/packages/react-select/src/diacritics.ts
 * Maybe take more from: https://lunicode.com ?
 */
const DiacriticsAndSymbols = [
    { base: "A", letters: "AⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ𝐀" },
    { base: "AA", letters: "Ꜳ" },
    { base: "AE", letters: "ÆǼǢ" },
    { base: "AO", letters: "Ꜵ" },
    { base: "AU", letters: "Ꜷ" },
    { base: "AV", letters: "ꜸꜺ" },
    { base: "AY", letters: "Ꜽ" },
    { base: "B", letters: "BⒷＢḂḄḆɃƂƁ𝐁" },
    { base: "C", letters: "CⒸＣĆĈĊČÇḈƇȻꜾ𝐂" },
    { base: "D", letters: "DⒹＤḊĎḌḐḒḎĐƋƊƉꝹ𝐃" },
    { base: "DZ", letters: "ǱǄ" },
    { base: "Dz", letters: "ǲǅ" },
    { base: "E", letters: "EⒺＥÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚƐƎ𝐄" },
    { base: "F", letters: "FⒻＦḞƑꝻ𝐅" },
    { base: "G", letters: "GⒼＧǴĜḠĞĠǦĢǤƓꞠꝽꝾ𝐆" },
    { base: "H", letters: "HⒽＨĤḢḦȞḤḨḪĦⱧⱵꞍ𝐇" },
    { base: "I", letters: "IⒾＩÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬƗ𝐈" },
    { base: "J", letters: "JⒿＪĴɈ𝐉" },
    { base: "K", letters: "KⓀＫḰǨḲĶḴƘⱩꝀꝂꝄꞢ𝐊" },
    { base: "L", letters: "LⓁＬĿĹĽḶḸĻḼḺŁȽⱢⱠꝈꝆꞀ𝐋" },
    { base: "LJ", letters: "Ǉ" },
    { base: "Lj", letters: "ǈ" },
    { base: "M", letters: "MⓂＭḾṀṂⱮƜ𝐌" },
    { base: "N", letters: "NⓃＮǸŃÑṄŇṆŅṊṈȠƝꞐꞤ𝐍" },
    { base: "NJ", letters: "Ǌ" },
    { base: "Nj", letters: "ǋ" },
    { base: "O", letters: "OⓄＯÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘǪǬØǾƆƟꝊꝌ𝐎" },
    { base: "OI", letters: "Ƣ" },
    { base: "OO", letters: "Ꝏ" },
    { base: "OU", letters: "Ȣ" },
    { base: "P", letters: "PⓅＰṔṖƤⱣꝐꝒꝔ𝐏" },
    { base: "Q", letters: "QⓆＱꝖꝘɊ𝐐" },
    { base: "R", letters: "RⓇＲŔṘŘȐȒṚṜŖṞɌⱤꝚꞦꞂ𝐑" },
    { base: "S", letters: "SⓈＳẞŚṤŜṠŠṦṢṨȘŞⱾꞨꞄ𝐒" },
    { base: "T", letters: "TⓉＴṪŤṬȚŢṰṮŦƬƮȾꞆ𝐓" },
    { base: "TZ", letters: "Ꜩ" },
    { base: "U", letters: "UⓊＵÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴɄ𝐔" },
    { base: "V", letters: "VⓋＶṼṾƲꝞɅ𝐕" },
    { base: "VY", letters: "Ꝡ" },
    { base: "W", letters: "WⓌＷẀẂŴẆẄẈⱲ𝐖" },
    { base: "X", letters: "XⓍＸẊẌ𝐗" },
    { base: "Y", letters: "YⓎＹỲÝŶỸȲẎŸỶỴƳɎỾ𝐘" },
    { base: "Z", letters: "ZⓏＺŹẐŻŽẒẔƵȤⱿⱫꝢ𝐙" },
    { base: "a", letters: "aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐ𝐚" },
    { base: "aa", letters: "ꜳ" },
    { base: "ae", letters: "æǽǣ" },
    { base: "ao", letters: "ꜵ" },
    { base: "au", letters: "ꜷ" },
    { base: "av", letters: "ꜹꜻ" },
    { base: "ay", letters: "ꜽ" },
    { base: "b", letters: "bⓑｂḃḅḇƀƃɓ𝐛" },
    { base: "c", letters: "cⓒｃćĉċčçḉƈȼꜿↄ𝐜" },
    { base: "d", letters: "dⓓｄḋďḍḑḓḏđƌɖɗꝺ𝐝" },
    { base: "dz", letters: "ǳǆ" },
    { base: "e", letters: "eⓔｅèéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛɇɛǝ𝐞" },
    { base: "f", letters: "fⓕｆḟƒꝼ𝐟" },
    { base: "g", letters: "gⓖｇǵĝḡğġǧģǥɠꞡᵹꝿ𝐠" },
    { base: "h", letters: "hⓗｈĥḣḧȟḥḩḫẖħⱨⱶɥ𝐡" },
    { base: "hv", letters: "ƕ" },
    { base: "i", letters: "iⓘｉìíîĩīĭïḯỉǐȉȋịįḭɨı𝐢" },
    { base: "j", letters: "jⓙｊĵǰɉ𝐣" },
    { base: "k", letters: "kⓚｋḱǩḳķḵƙⱪꝁꝃꝅꞣ𝐤" },
    { base: "l", letters: "lⓛｌŀĺľḷḹļḽḻſłƚɫⱡꝉꞁꝇ𝐥" },
    { base: "lj", letters: "ǉ" },
    { base: "m", letters: "mⓜｍḿṁṃɱɯ𝐦" },
    { base: "n", letters: "nⓝｎǹńñṅňṇņṋṉƞɲŉꞑꞥ𝐧" },
    { base: "nj", letters: "ǌ" },
    { base: "o", letters: "oⓞｏòóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộǫǭøǿɔꝋꝍɵ𝐨" },
    { base: "oi", letters: "ƣ" },
    { base: "ou", letters: "ȣ" },
    { base: "oo", letters: "ꝏ" },
    { base: "p", letters: "pⓟｐṕṗƥᵽꝑꝓꝕ𝐩" },
    { base: "q", letters: "qⓠｑɋꝗꝙ𝐪" },
    { base: "r", letters: "rⓡｒŕṙřȑȓṛṝŗṟɍɽꝛꞧꞃ𝐫" },
    { base: "s", letters: "sⓢｓßśṥŝṡšṧṣṩșşȿꞩꞅẛ𝐬" },
    { base: "t", letters: "tⓣｔṫẗťṭțţṱṯŧƭʈⱦꞇ𝐭" },
    { base: "tz", letters: "ꜩ" },
    { base: "u", letters: "uⓤｕùúûũṹūṻŭüǜǘǖǚủůűǔȕȗưừứữửựụṳųṷṵʉ𝐮" },
    { base: "v", letters: "vⓥｖṽṿʋꝟʌ𝐯" },
    { base: "vy", letters: "ꝡ" },
    { base: "w", letters: "wⓦｗẁẃŵẇẅẘẉⱳ𝐰" },
    { base: "x", letters: "xⓧｘẋẍ𝐱" },
    { base: "y", letters: "yⓨｙỳýŷỹȳẏÿỷẙỵƴɏỿ𝐲" },
    { base: "z", letters: "zⓩｚźẑżžẓẕƶȥɀⱬꝣ𝐳" },
];

const diacriticsAndSymbolsRegex = new RegExp("[" + DiacriticsAndSymbols.map((d) => d.letters).join("") + "]", "gu");

/** Inverse mapping (e.g ⓩ → z) */
const diacriticsAndSymbolsReplacement: { [key: string]: string } = {};
for (const entry of DiacriticsAndSymbols) {
    for (const letter of entry.letters) {
        diacriticsAndSymbolsReplacement[letter] = entry.base;
    }
}

/**
 * Replaces diacritics and symbols with their base characters.
 * e.g. ⓩ → z
 * e.g. á → a
 */
export const stripDiacriticsAndSymbols = (text: string) =>
    text.replace(diacriticsAndSymbolsRegex, (s) => diacriticsAndSymbolsReplacement[s]);

/**
 * Turns a string into a format that is friendly for matching (for using `includes` or `startsWith`)
 * Both the string to search and all the strings to be matched should be passed through this function.
 *
 * Useful for searching in the UI.
 */
export const matchFormat = (text: string) => stripDiacriticsAndSymbols(normalizeText(text)).toLocaleLowerCase();
