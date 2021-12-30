interface TelegramMessage {
    id: number;
    type: "message" | "service" | unknown;
    date: string;
    from: string;
    from_id: number;
    reply_to_message_id?: number;
    text: string | TextArray[];
}

interface TextArray {
    type: "bot_command" | "link" | unknown;
    text: string;
}
