// Types for chat dumps from https://github.com/Tyrrrz/DiscordChatExporter
// See https://github.com/Tyrrrz/DiscordChatExporter/blob/master/DiscordChatExporter.Core/Exporting/Writers/JsonMessageWriter.cs

type Snowflake = string;

type DiscordChannelType =
    | "DirectGroupTextChat"
    | "DirectTextChat"
    | "GuildCategory"
    | "GuildDirectory"
    | "GuildForum"
    | "GuildNews"
    | "GuildNewsThread"
    | "GuildPrivateThread"
    | "GuildPublicThread"
    | "GuildStageVoice"
    | "GuildTextChat"
    | "GuildVoiceChat"
    | string;

type DiscordMessageType =
    | "Call"
    | "ChannelIconChange"
    | "ChannelNameChange"
    | "ChannelPinnedMessage"
    | "Default"
    | "GuildMemberJoin"
    | "RecipientAdd"
    | "RecipientRemove"
    | "Reply"
    | string;

interface DiscordGuild {
    id: Snowflake;
    name: string;
    iconUrl: string;
}

interface DiscordChannel {
    id: Snowflake;
    type: DiscordChannelType;
    name: string;
}

interface DiscordMessage {
    id: Snowflake;
    type: DiscordMessageType;
    timestamp: string;
    timestampEdited: string;
    callEndedTimestamp: string;
    isPinned: boolean;
    content: string;
    author: DiscordAuthor;
    reference?: {
        channelId: Snowflake | null;
        guildId: Snowflake | null;
        messageId: Snowflake;
    };
    attachments: DiscordAttachment[];
    // NOTE: we allow stickers to be undefined, because they were not supported until
    // https://github.com/Tyrrrz/DiscordChatExporter/issues/638 was resolved
    stickers?: DiscordSticker[];
    reactions: DiscordReaction[];
    mentions: DiscordMention[];
}

interface DiscordAuthor {
    id: Snowflake;
    name: string;
    discriminator: string;
    nickname: "Deleted User" | string;
    color: string | null;
    isBot: boolean;
    avatarUrl: string;
}

interface DiscordSticker {
    id: Snowflake;
    name: string;
    format: "Png" | "PngAnimated" | "Lottie";
    sourceUrl: string;
}

interface DiscordReaction {
    count: number;
    emoji: {
        id: Snowflake | null;
        name: string;
        isAnimated: boolean;
        imageUrl: string;
    };
}

interface DiscordAttachment {
    id: Snowflake;
    url: string;
    fileName: string;
    fileSizeBytes: number;
}

interface DiscordMention {
    id: Snowflake;
    name: string;
    discriminator: string;
    nickname: string;
    isBot: boolean;
}
