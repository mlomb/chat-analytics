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

export type StepInfo = NewStep | ProgressStep | DoneStep;
