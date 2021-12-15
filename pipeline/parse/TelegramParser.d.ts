/*
    Types for chat dumps from Telegram (JSON)

    Types here are not remotely complete, but try to keep here what is in use
*/

interface TelegramMessage {
    id: number;
    type: "message" | "service" | unknown;
    date: string;
    from: string;
    from_id: number;
    reply_to_message_id?: number;
    text: string | TextArray[];
}

export interface TextArray {
    type: "bot_command" | "link" | unknown;
    text: string;
}
