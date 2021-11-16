import { Platform } from "@pipeline/Types";

import { Database } from "@pipeline/parse/Database";
import { parse as parseDiscord } from "@pipeline/parse/DiscordParser";

export type ParseFn = (files: string[]) => Database;

const parseFunctions = {
    discord: parseDiscord,
    telegram: parseDiscord, //parseTelegram,
    whatsapp: parseDiscord, //parseWhatsApp,
};

export const parse = (files: string[], platform: Platform): Database => parseFunctions[platform](files);
