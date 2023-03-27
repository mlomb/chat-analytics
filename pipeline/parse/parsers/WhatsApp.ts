import { AttachmentType } from "@pipeline/Attachments";
import { matchFormat } from "@pipeline/process/nlp/Text";

const FilenamePatterns = [
    "WhatsApp Chat - ",
    "WhatsApp Chat with ",
    "Chat de WhatsApp con ",
    "Чат WhatsApp с ",
    "Chat WhatsApp con ",
    "Conversa no WhatsApp com ",
    "Conversa do WhatsApp com ",
    "WhatsApp Chat mit ",
    "Discussion WhatsApp avec ",
    // TODO: find more patterns here https://cs.github.com/?scopeName=All+repos&scope=&q=email_conversation_subject
];
// also include versions with _ instead of spaces
FilenamePatterns.push(...FilenamePatterns.map((pattern) => pattern.replace(/ /g, "_")));

export const extractChatName = (filename: string): string | undefined => {
    let name: string | undefined;
    for (const template of FilenamePatterns) {
        // expected: <pattern><chat name>.txt
        if (
            matchFormat(filename).startsWith(matchFormat(template)) &&
            (filename.endsWith(".txt") || filename.endsWith(".zip"))
        ) {
            name = filename.slice(template.length, -4);
            break;
        }
    }
    if (name !== undefined) {
        // replace occasional _ that appear in the name by spaces
        name = name.replace(/_/g, " ").trim();
    }
    return name;
};

// some exports include those chars for some reason, remove them
export const removeBadChars = (str: string) => str.replace(/[\u202a\u200e\u202c\xa0]/g, "");

const WelcomePatterns = [
    "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.",
    "Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat, ni siquiera WhatsApp, puede leerlos ni escucharlos.",
];

export const isGroupWelcome = (content: string) =>
    WelcomePatterns.some((pattern) => content.toLocaleLowerCase().includes(pattern.toLocaleLowerCase()));

type PatternType =
    // generic multimedia file (Android exports)
    | "media"
    // specific multimedia types (iOS exports)
    | "image"
    | "video"
    | "audio"
    | "document"
    | "GIF"
    | "sticker";

const Patterns: {
    [lang: string]: {
        [key in PatternType]?: string[];
    };
} = {
    af: { media: ["<media weggelaat>"] },
    ar: { media: ["<تم استبعاد الوسائط>", "<تم استبعاد الوسائط>"] },
    az: { media: ["<media buraxıldı>", "<Media çıxarılmışdır>"] },
    bg: { media: ["<Без файл>"] },
    bn: { media: ["<মিডিয়া বাদ দেওয়া হয়েছে>", "<মিডিয়া বাদ দেওয়া হয়েছে>"] },
    ca: { media: ["<fitxers multimèdia omesos>", "<Mitjans omesos>"] },
    cs: { media: ["<média vynechány>", "< Média vynechána >"] },
    da: { media: ["<medier udeladt>", "<Mediefil udeladt>"] },
    de: { media: ["<medien ausgeschlossen>", "<Medien weggelassen>"] },
    el: { media: ["<αρχείο παραλήφθηκε>", "<Εξαίρεση πολυμέσων>"] },
    en: {
        media: ["<media omitted>"],
        image: ["<image omitted>", "image omitted"],
        video: ["<video omitted>", "video omitted"],
        document: ["<document omitted>", "document omitted"],
        audio: ["<audio omitted>", "audio omitted"],
        GIF: ["<GIF omitted>", "GIF omitted"],
        sticker: ["<sticker omitted>", "sticker omitted"],
    },
    es: {
        media: ["<multimedia omitido>", "<Archivo omitido>"],
        image: ["<imagen omitida>", "imagen omitida"],
        video: ["<video omitido>", "video omitido"],
        document: ["<documento omitido>", "documento omitido"],
        audio: ["<audio omitido>", "audio omitido"],
        GIF: ["<GIF omitido>", "GIF omitido"],
        sticker: ["<sticker omitido>", "sticker omitido"],
    },
    et: { media: ["<meedia välja jäetud>", "<Meedia ära jäetud>"] },
    fa: { media: ["<رسانه حذف شد>", "< پيوست نما/آهنگ حذف شد >"] },
    fi: { media: ["<media jätettiin pois>", "<Media jätetty pois>"] },
    fr: { media: ["<médias omis>", "<Fichier omis>"] },
    gu: { media: ["<મિડિયા છોડી મૂકાયું>", "<મીડિયા અવગણવામાં આવ્યા>"] },
    hi: { media: ["<मीडिया के बिना>"] },
    hr: { media: ["<medijski zapis izostavljen>", "<Medijski zapis izostavljen>"] },
    hu: { media: ["<média elhagyva>", "<Hiányzó médiafájl>"] },
    in: { media: ["<media tidak disertakan>"] },
    it: { media: ["<media omessi>", "<Media omesso>"] },
    iw: { media: ["<המדיה לא נכללה>", "<מדיה הושמטה>"] },
    ja: { media: ["<メディアなし>", "<メディアは含まれていません>"] },
    kk: { media: ["<файлдар қосылмаған>", "<Файл қосылған жоқ>"] },
    kn: { media: ["<ಮಾಧ್ಯಮ ಕೈಬಿಡಲಾಗಿದೆ>"] },
    ko: { media: ["<미디어 파일 제외됨>", "<미디어 파일을 생략한 대화내용>"] },
    lo: { media: ["<ບໍ່ລວມມີເດຍ>"] },
    lt: { media: ["<medija praleista>", "<Praleistas medijos turinys>"] },
    lv: { media: ["<nav iekļauta multivide>", "<Bez multivides>"] },
    mk: { media: ["<без фајлови>", "<Без фајл>"] },
    ml: { media: ["<മീഡിയ ഒഴിവാക്കി>"] },
    mr: { media: ["<मीडिया वगळण्यात आला>", "<मीडिया वगळले>"] },
    ms: { media: ["<media dikecualikan>", "<Media disingkirkan>"] },
    nb: { media: ["<media utelatt>", "<Uten vedlegg>"] },
    nl: { media: ["<media weggelaten>", "<Media weggelaten>"] },
    pa: { media: ["<ਮੀਡੀਆ ਛੱਡਿਆ>", "<ਮੀਡੀਆ ਛਡਿਆ ਗਿਆ>"] },
    pl: { media: ["<pominięto multimedia>", "<pliki pominięto>"] },
    pt: { media: ["<ficheiro não revelado>", "<Mídia omitida>"] },
    ro: { media: ["<conținut media omis>"] },
    ru: { media: ["<без медиафайлов>", "<Файл пропущен>"] },
    sk: { media: ["<Médiá vynechané>"] },
    sl: { media: ["<datoteke izpuščene>", "<Medij izpuščen>"] },
    sq: { media: ["<media u hoq>", "<Media hequr>"] },
    sr: { media: ["<медији су изостављени>"] },
    sv: { media: ["<media utelämnat>", "<Media har utelämnats>"] },
    sw: { media: ["<media hazijajumuishwa>", "<Media imerukwa>"] },
    ta: { media: ["<கோப்புகள் விடப்பட்டன>", "< ஊடகங்கள் நீக்கப்பட்டது >"] },
    te: { media: ["<మీడియా విస్మరించబడింది>", "<మాధ్యమం విస్మరించబడింది>"] },
    th: { media: ["<ไฟล์สื่อถูกลบ>", "<สื่อถูกลบ>"] },
    tl: { media: ["<ınalis ang media>", "<Walang kalakip na media>"] },
    tr: { media: ["<medya dahil edilmedi>", "<Medya atlanmış>"] },
    uk: { media: ["<медіа пропущено>"] },
    ur: { media: ["<میڈیا چھوڑ دیا گیا>", "<میڈیا ہٹا دیا گیا>"] },
    uz: { media: ["<fayl o‘tkazib yuborildi>"] },
    vi: { media: ["<bỏ qua tệp phương tiện>", "<Bỏ qua Media>"] },
    // zh-rTW, zh-rHK, zh-rSG, zh-rCN
    zh: { media: ["<忽略多媒體檔>", "<省略多媒体文件>"] },
};

// reduce Patterns
const normalize = (x: string) => x.toLocaleLowerCase().trim();
const reducePatterns = (key: PatternType) => {
    const res: string[] = [];
    for (const lang in Patterns) {
        const list = Patterns[lang][key];
        if (list) res.push(...list.map(normalize));
    }
    return res;
};
const PatternsFlat = {
    media: reducePatterns("media"),
    image: reducePatterns("image"),
    video: reducePatterns("video"),
    audio: reducePatterns("audio"),
    document: reducePatterns("document"),
    GIF: reducePatterns("GIF"),
    sticker: reducePatterns("sticker"),
};
const PatternsType: {
    [key in PatternType]: AttachmentType;
} = {
    // generic
    // we can't know what type it is 😢
    media: AttachmentType.Other,
    // specific
    image: AttachmentType.Image,
    video: AttachmentType.Video,
    audio: AttachmentType.Audio,
    document: AttachmentType.Document,
    GIF: AttachmentType.ImageAnimated,
    sticker: AttachmentType.Sticker,
};

export const matchAttachmentType = (input: string): AttachmentType | undefined => {
    const _input = normalize(input);
    let key: PatternType;
    for (key in PatternsType) {
        for (const pattern of PatternsFlat[key]) {
            if (_input.endsWith(pattern)) return PatternsType[key];
        }
    }
    return undefined;
};
