// raw ID that comes from the platform (e.g: 9876554321)
export type RawID = string | number;

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
