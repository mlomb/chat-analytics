export type ID = string;

export type Timestamp = number;

export type Platform = "discord" | "telegram" | "whatsapp";

export interface FileInput {
    name: string;
    size: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}

export interface ReportConfig {
    platform: Platform;
}

export interface NewStep {
    type: "new";
    title: string;
    subject?: string;
}
export interface ProgressStep {
    type: "progress";
    progress: [number, number];
    format: "number" | "bytes";
}
export interface DoneStep {
    type: "done";
}
export interface ErrorStep {
    type: "error";
    error: string;
}
export interface ReportResult {
    type: "result";
    title: string;
    json?: string;
    html: string;
    time: Timestamp;
    counts: {
        authors: number;
        channels: number;
        messages: number;
    };
}

export type StepInfo = NewStep | ProgressStep | DoneStep | ErrorStep | ReportResult;
