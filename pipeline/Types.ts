// a zero-based index
export type Index = number;

// UTC timestamp
export type Timestamp = number;

// available platforms
export type Platform = "discord" | "messenger" | "telegram" | "whatsapp";

// dm: direct message between TWO users
// group: direct message between MORE THAN TWO users
// text: generic text channel
export type ChannelType = "dm" | "group" | "text";

// configuration, set in the UI
export interface ReportConfig {
    platform: Platform;
    demo?: boolean;
}
