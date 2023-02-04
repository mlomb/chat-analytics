import { Platform } from "@pipeline/Platforms";
import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/parsers/DiscordParser";
import { MessengerParser } from "@pipeline/parse/parsers/MessengerParser";
import { TelegramParser } from "@pipeline/parse/parsers/TelegramParser";
import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

export const createParser = (platform: Platform): Parser => {
    let parser: Parser | null = null;
    switch (platform) {
        case "discord":
            parser = new DiscordParser();
            break;
        case "messenger":
            parser = new MessengerParser();
            break;
        case "whatsapp":
            parser = new WhatsAppParser();
            break;
        case "telegram":
            parser = new TelegramParser();
            break;
    }

    return parser;
};
