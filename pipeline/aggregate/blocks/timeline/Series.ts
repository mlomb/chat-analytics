// WARNING: Don't import anything from the pipeline here,
//          this file is meant to be used in the report app as well
import type { Database } from "@pipeline/process/Types";

export interface TimelineSeriesDefinition {
    title: string;
    guildIndex?: number;
    channelIndex?: number;
}

/** Generates the series that should be displayed */
export const generateSeries = (db: Database): TimelineSeriesDefinition[] => {
    return [
        // keep guilds that have a channel that is NOT a DM/group
        ...db.guilds
            .map((guild, guildIndex) => ({ guild, guildIndex }))
            .filter(({ guildIndex }) => db.channels.some((c) => c.guildIndex === guildIndex && c.type === "text"))
            .map(({ guild, guildIndex }) => ({
                title: guild.name,
                guildIndex,
            })),
        // add all groups as series
        ...db.channels
            .map((channel, channelIndex) => ({ channel, channelIndex }))
            .filter(({ channel }) => channel.type === "group")
            .map(({ channel, channelIndex }) => ({
                title: channel.name,
                channelIndex,
            })),
    ];
};
