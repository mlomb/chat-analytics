interface TelegramMessage {
    date: string;
    edited: string | undefined;
    from_id: number;
    // sometimes from is null, I don't know why
    from: string | null;
    id: number;
    mime_type?: string;
    reply_to_message_id?: number;
    sticker_emoji?: string;
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
