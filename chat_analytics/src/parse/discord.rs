use crate::parse::json::read_top_level_key;
use crate::parse::{ChannelType, ChatParser, PAuthor, PChannel, PGuild, PMessage, ParsedEntity};
use ::serde::Deserialize;
use chrono::{DateTime, FixedOffset};
use serde::Serialize;
use std::io::{Read, Seek, SeekFrom};
use struson::json_path;
use struson::reader::{JsonReader, JsonStreamReader};

// Type alias for Discord snowflake IDs
type Snowflake = String;

/// Extract the timestamp from a Discord snowflake
///
/// See https://discord.com/developers/docs/reference#snowflakes
fn extract_timestamp(snowflake: &Snowflake) -> u64 {
    let snowflake = snowflake.parse::<u64>().unwrap();
    (snowflake >> 22) + 1420070400000
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum DiscordChannelType {
    DirectGroupTextChat,
    DirectTextChat,
    GuildCategory,
    GuildDirectory,
    GuildForum,
    GuildNews,
    GuildNewsThread,
    GuildPrivateThread,
    GuildPublicThread,
    GuildStageVoice,
    GuildTextChat,
    GuildVoiceChat,

    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum DiscordMessageType {
    Call,
    ChannelIconChange,
    ChannelNameChange,
    ChannelPinnedMessage,
    Default,
    GuildMemberJoin,
    RecipientAdd,
    RecipientRemove,
    Reply,
    ThreadCreated,

    #[serde(other)]
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordGuild {
    id: Snowflake,
    name: String,
    iconUrl: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct DiscordChannel {
    id: Snowflake,
    #[serde(rename = "type")]
    r#type: DiscordChannelType,
    name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordAuthor {
    id: Snowflake,
    name: String,
    discriminator: String,
    /// Notably, it can be "Deleted User"
    nickname: Option<String>,
    color: Option<String>,
    isBot: bool,
    avatarUrl: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordSticker {
    id: Snowflake,
    name: String,
    format: DiscordStickerFormat,
    sourceUrl: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
enum DiscordStickerFormat {
    Png,
    PngAnimated,
    Lottie,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct DiscordReaction {
    count: u32,
    emoji: DiscordEmoji,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordEmoji {
    id: Option<Snowflake>,
    name: String,
    isAnimated: bool,
    imageUrl: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordAttachment {
    id: Snowflake,
    url: String,
    fileName: String,
    fileSizeBytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordMention {
    id: Snowflake,
    name: String,
    discriminator: String,
    nickname: String,
    isBot: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordMessageReference {
    channelId: Option<Snowflake>,
    guildId: Option<Snowflake>,
    messageId: Option<Snowflake>,
}

/// Discord Chat Exporter message representation
///
/// See https://github.com/Tyrrrz/DiscordChatExporter/blob/master/DiscordChatExporter.Core/Exporting/JsonMessageWriter.cs
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct DiscordMessage {
    id: Snowflake,
    #[serde(rename = "type")]
    r#type: DiscordMessageType,
    timestamp: String,
    timestampEdited: Option<String>,
    callEndedTimestamp: Option<String>,
    isPinned: bool,
    content: String,
    author: DiscordAuthor,
    reference: Option<DiscordMessageReference>,
    #[serde(default)]
    attachments: Vec<DiscordAttachment>,
    #[serde(default)]
    stickers: Vec<DiscordSticker>,
    #[serde(default)]
    reactions: Vec<DiscordReaction>,
    #[serde(default)]
    mentions: Vec<DiscordMention>,
}

/// Converts a Discord Guild to a standard PGuild
fn convert_guild(guild: DiscordGuild) -> PGuild {
    PGuild {
        id: guild.id,
        name: guild.name,
        avatar: if guild.iconUrl == "https://cdn.discordapp.com/embed/avatars/0.png" {
            // this is the default icon, we treat it as having no icon at all
            None
        } else {
            Some(guild.iconUrl)
        },
    }
}

/// Converts Discord Guild and Channel to a standard PGuild and PChannel
fn convert_channel(guild: DiscordGuild, channel: DiscordChannel) -> PChannel {
    PChannel {
        r#type: match channel.r#type {
            DiscordChannelType::DirectTextChat => ChannelType::Direct,
            DiscordChannelType::DirectGroupTextChat => ChannelType::Group,
            // fall back to Text for other types
            _ => ChannelType::Text,
        },
        avatar: if matches!(channel.r#type, DiscordChannelType::DirectGroupTextChat) {
            // if the channel is a group:
            //   + the default avatar is the timestamp of the Snowflake mod 8
            //   + image avatars are not available in the export, see https://github.com/Tyrrrz/DiscordChatExporter/issues/987
            // TODO: check this again!
            let hash = extract_timestamp(&channel.id) % 8;
            Some(hash.to_string())
        } else {
            // other kind of channels don't have avatars
            None
        },
        guild: convert_guild(guild),
        name: channel.name,
        id: channel.id,
    }
}

/// Converts a Discord author to a standard PAuthor
fn convert_author(author: DiscordAuthor) -> PAuthor {
    // Discord allows users to have different nicknames depending on the chat. We honor the nickname first
    let name = author.nickname.unwrap_or(author.name);
    let name = if name == "Deleted User" {
        name + " #" + &author.id
    } else if author.discriminator != "0000" {
        name + "#" + &author.discriminator
    } else {
        name
    };

    // About the avatar:
    // See: https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints
    // Can be:
    // - https://cdn.discordapp.com/avatars/user_id/user_avatar.png (custom avatar, we only care about `user_id/user_avatar`)
    // - https://cdn.discordapp.com/embed/avatars/discriminator.png (default color avatar)
    // - <path>.png/gif (custom avatar but stored using `--media=true` in DCE)
    let avatar = if let Some(avatar_url) = author.avatarUrl {
        if avatar_url.contains("https://cdn.discordapp.com/avatars") {
            // custom avatar as URL, extract "user_id/user_avatar"
            avatar_url[35..].split(".").next().map(|s| s.to_string())
        } else if !avatar_url.starts_with("http") {
            // assume it's a custom avatar stored as media
            // store the full path to the avatar
            // note that this will not work unless the user puts the report.html in the correct
            // folder, but since we don't have the online URL, we do this as best-effort
            Some(avatar_url)
        } else {
            // unsupported avatar URL?
            None
        }
    } else {
        // no avatar
        None
    };

    PAuthor {
        id: author.id,
        name,
        bot: author.isBot,
        avatar,
    }
}

/// Parser for DCE (Discord Chat Exporter) (https://github.com/Tyrrrz/DiscordChatExporter) files.
///
/// We are assuming that in the JSON file, the "guild" and "channel" keys appear before
/// any array in the top level object. That includes the "messages" array.
/// DCE exports can get rather big, but since we are streaming the file, we can support big exports 😊
///
/// Note that DCE exports contain one channel per file, so a single file will always contain
/// one guild and one channel.
pub struct DiscordChatExporterParser<R: Read + Seek> {
    // The JSON stream reader, positioned at some point in the messages array
    messages_stream: JsonStreamReader<R>,

    // The channel this file is from, already converted to standard format
    channel: PChannel,
}

impl<R: Read + Seek> ChatParser<R> for DiscordChatExporterParser<R> {
    fn new(mut reader: R) -> Result<Self, Box<dyn std::error::Error>> {
        let guild: DiscordGuild = read_top_level_key(&mut reader, "guild")?;
        let channel: DiscordChannel = read_top_level_key(&mut reader, "channel")?;

        // reset reader
        reader.seek(SeekFrom::Start(0))?;

        // create & seek to messages key
        let mut messages_stream = JsonStreamReader::new(reader);
        messages_stream.seek_to(&json_path!["messages"])?;
        messages_stream.begin_array()?;

        Ok(Self {
            messages_stream,
            channel: convert_channel(guild, channel),
        })
    }

    fn parse_next(&mut self) -> Result<Option<ParsedEntity>, Box<dyn std::error::Error>> {
        if !self.messages_stream.has_next()? {
            return Ok(None);
        }
        let message: DiscordMessage = self.messages_stream.deserialize_next()?;

        // Timestamps in the export are in UTC
        // "YYYY-MM-DDTHH:MM:SS.mmm+00:00"
        let timestamp: DateTime<FixedOffset> = message.timestamp.parse()?;
        let timestamp_edit: Option<DateTime<FixedOffset>> = message
            .timestampEdited
            .map(|s| s.parse::<DateTime<FixedOffset>>())
            .transpose()?;

        let msg = PMessage {
            id: message.id,
            channel: self.channel.clone(),
            author: convert_author(message.author),
            timestamp: timestamp.timestamp(),
            timestamp_edit: timestamp_edit.map(|t| t.timestamp()),
            reply_to: message.reference.and_then(|r| r.messageId),
            text_content: Some(message.content),
            attachments: vec![],
            reactions: vec![],
        };

        Ok(Some(ParsedEntity::Message(msg)))
    }
}
