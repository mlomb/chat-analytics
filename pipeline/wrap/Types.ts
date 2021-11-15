export type BlockState = "no-data" | "ready" | "stale" | "loading" | "error";

export interface BlockData {}

export interface MessageStatsBlock extends BlockData {
    total: number;
    sent: number;
    received: number;
}

export type BlockKey = string;
