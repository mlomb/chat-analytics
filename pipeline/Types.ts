export type ID = string;

export type Timestamp = number;

export type Platform = "discord" | "telegram" | "whatsapp";

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

export type StepInfo = NewStep | ProgressStep | DoneStep | ErrorStep;
