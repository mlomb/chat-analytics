type TelegramChannelType =
    | "bot_chat"
    | "personal_chat"
    | "private_channel"
    | "private_group"
    | "private_supergroup"
    | "public_group"
    | "public_supergroup"
    | "saved_messages"
    | string;

// some available keys: id, type, date, actor, actor_id, action, title, text, from, from_id, reply_to_message_id, file, thumbnail, media_type, sticker_emoji, width, height, photo, via_bot, mime_type, duration_seconds, edited, inviter, forwarded_from, message_id, members, performer, game_title, game_description, game_link, game_message_id, score, place_name, address, location_information, poll, saved_from, author, duration
interface TelegramMessage {
    date: string;
    edited: string | undefined;
    from_id: number;
    from: string | null; // sometimes from is null, I don't know why
    id: number;
    location_information: any;
    media_type: "sticker" | unknown;
    mime_type?: string;
    photo?: string;
    poll?: { question: string };
    reply_to_message_id?: number;
    text: string | TextArray[];
    type: "message" | "service" | unknown;
}

interface TextArray {
    type:
        | "bold"
        | "bot_command"
        | "code"
        | "email"
        | "hashtag"
        | "italic"
        | "link"
        | "mention"
        | "pre"
        | "strikethrough"
        | "text_link"
        | "underline"
        | unknown;
    text: string;
}
