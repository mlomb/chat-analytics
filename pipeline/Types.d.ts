// Raw ID that comes from the platform
export type RawID = string | number;

// Internal ID that is used in the pipeline (incremental)
export type ID = number;

// offset in bytes in the SerializedData buffer
export type Address = number;

// UTC timestamp
export type Timestamp = number;

// available platforms
export type Platform = "discord" | "telegram" | "whatsapp";

export interface ReportConfig {
    platform: Platform;
}

export interface FileInput {
    name: string;
    size: number;
    slice(start?: number, end?: number): Promise<ArrayBuffer>;
}
