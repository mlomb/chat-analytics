/*
    Types for chat dumps from https://github.com/Tyrrrz/DiscordChatExporter

    Types here are not remotely complete, but try to keep here what is in use

    See https://github.com/Tyrrrz/DiscordChatExporter/blob/master/DiscordChatExporter.Core/Exporting/Writers/JsonMessageWriter.cs
*/

type Snowflake = string;

export interface DiscordExportFile {
    guild: Guild;
    channel: Channel;
    messages: Message[];
    messageCount: number;
}

interface Guild {
    id: Snowflake;
    name: string;
    iconUrl: string;
}

interface Channel {
    id: Snowflake;
    type: "GuildTextChat" | unknown;
    name: string;
}

interface Message {
    id: Snowflake;
    type: "Default" | unknown;
    timestamp: string;
    timestampEdited: string;
    callEndedTimestamp: string;
    isPinned: boolean;
    content: string;
    author: Author;
}

interface Author {
    id: string;
    name: string;
    discriminator: string;
    nickname: string;
    color: string | null;
    isBot: boolean;
    avatarUrl: string;
}
