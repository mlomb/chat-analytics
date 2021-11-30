export type ID = string;

export type Timestamp = number;

export type Platform = "discord" | "telegram" | "whatsapp";

export interface FileInput {
    name: string;
    text(): Promise<string>;
}

export interface ReportConfig {
    platform: Platform;
}

export interface NewStep {
    type: "new";
    title: string;
    total?: number;
}
export interface ProgressStep {
    type: "progress";
    progress: number;
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
    html: string;
    time: number;
    counts: {
        authors: number;
        channels: number;
        messages: number;
    };
}

export type StepInfo = NewStep | ProgressStep | DoneStep | ErrorStep | ReportResult;
