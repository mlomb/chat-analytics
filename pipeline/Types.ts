import { Platform } from "@pipeline/Platforms";

/** A zero based index */
export type Index = number;

/** UTC timestamp */
export type Timestamp = number;

/**
 * Type of channel
 *
 * - dm: direct message between TWO users
 * - group: direct message between MORE THAN TWO users
 * - text: generic text channel
 */
export type ChannelType = "dm" | "group" | "text";

/** Configuration for database and report generation */
export interface Config {
    /** Target platform */
    platform: Platform;

    /** Whether this report should be marked as a demo */
    demo?: boolean;
}
