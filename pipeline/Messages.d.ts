///
/// APP WORKER MESSAGES
///

export interface NewMessage {
    type: "new";
    title: string;
    subject?: string;
}
export interface ProgressMessage {
    type: "progress";
    progress: [number, number];
    format: "number" | "bytes";
}
export interface DoneMessage {
    type: "done";
}
export interface ErrorMessage {
    type: "error";
    error: string;
}
export interface ResultMessage {
    type: "result";
    title: string;
    dataBlob: Blob;
    htmlBlob: Blob;
    time: Timestamp;
    counts: {
        authors: number;
        channels: number;
        messages: number;
    };
}

export type StepMessage = NewMessage | ProgressMessage | DoneMessage | ErrorMessage | ResultMessage;

///
/// REPORT WORKER MESSAGES
///

// Receive compressed data
export interface InitMessage {
    type: "init";
    dataStr: string;
}

export interface DecompressProgressMessage {
    type: "decompress";
    progress: [number, number];
}

// Send required data for the UI
export interface ReadyMessage {
    type: "ready";
    basic: Basic;
    blocksDesc: typeof BlocksDesc;
}

// Receive a request to compute a block
export interface BlockRequestMessage {
    type: "request";
    blockKey: BlockKey;
    filters: Partial<Filters>;
}

// Send the computed block back to the UI
export interface BlockResultMessage {
    type: "result";
    blockKey: BlockKey;
    state: BlockState;
    data: any | null;
}
