interface MessengerExportFile {
    participants: {
        name: string;
    }[];
    // Note: the messages array is limited to 10k items
    messages: MessengerMessage[];
    title: string;
    is_still_participant: boolean;
    thread_type: "Regular" | unknown;
    thread_path: string;
    magic_words: unknown[];
}

interface MessengerMessage {
    // sender_id_INTERNAL: number;
    sender_name: string;
    timestamp_ms: number;
    content?: string;
    is_unsent?: boolean;
    share: any;
    files: any;
    photos: any;
    audio_files: any;
    ip: string; // wtf
}
