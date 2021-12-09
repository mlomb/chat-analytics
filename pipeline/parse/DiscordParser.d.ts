/*
    Types for chat dumps from https://github.com/Tyrrrz/DiscordChatExporter

    Types here are not remotely complete, but try to keep here what is in use

    See https://github.com/Tyrrrz/DiscordChatExporter/blob/master/DiscordChatExporter.Core/Exporting/Writers/JsonMessageWriter.cs
*/

type Snowflake = string;

export interface DiscordExportFile {
    guild: DiscordGuild;
    channel: DiscordChannel;
    messages: Message[];
    messageCount: number;
}

export interface DiscordGuild {
    id: Snowflake;
    name: string;
    iconUrl: string;
}

export interface DiscordChannel {
    id: Snowflake;
    type: "GuildTextChat" | unknown;
    name: string;
}

export interface DiscordMessage {
    id: Snowflake;
    type: "Default" | unknown;
    timestamp: string;
    timestampEdited: string;
    callEndedTimestamp: string;
    isPinned: boolean;
    content: string;
    author: DiscordAuthor;
}

export interface DiscordAuthor {
    id: Snowflake;
    name: string;
    discriminator: string;
    nickname: string;
    color: string | null;
    isBot: boolean;
    avatarUrl: string;
}
