use serde::{Deserialize, Serialize};
use std::io::{Read, Seek};

/// Platform's own ID (e.g: a Discord Snowflake)
pub type PlatformId = String;

pub type UnixTimestamp = i64;

/// Guild interface produced by parsers
#[derive(Debug, Clone)]
pub struct PGuild {
    pub id: String,
    pub name: String,
    pub avatar: Option<String>,
}

#[derive(Debug, Clone)]
pub enum ChannelType {
    /// Direct message between two users
    Direct,
    /// Direct message between more than two users
    Group,
    /// Generic text channel
    Text,
}

/// Types of attachments
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Hash, Clone)]
#[serde(rename_all = "snake_case")]
pub enum AttachmentType {
    Image,
    ImageAnimated, // (GIFs)
    Video,
    Sticker,
    Audio,
    Document,
    Other,
}

/// Channel interface produced by parsers
#[derive(Debug, Clone)]
pub struct PChannel {
    pub id: PlatformId,
    pub guild: PGuild,
    pub r#type: ChannelType,
    pub name: String,
    pub avatar: Option<String>,
}

/// Author interface produced by parsers
#[derive(Debug, Clone)]
pub struct PAuthor {
    pub id: PlatformId,
    pub name: String,
    pub bot: bool,
    pub avatar: Option<String>,
}

/// Message interface produced by parsers
#[derive(Debug, Clone)]
pub struct PMessage {
    pub id: PlatformId,
    pub channel: PChannel,
    pub author: PAuthor,
    pub timestamp: UnixTimestamp,
    pub timestamp_edit: Option<UnixTimestamp>,
    pub reply_to: Option<PlatformId>,

    pub text_content: Option<String>,
    pub attachments: Vec<AttachmentType>,
    pub reactions: Vec<(PEmoji, u32)>,
}

#[derive(Debug)]
pub struct PCall {
    pub id: PlatformId,
    /// The user who started the call
    pub author_id: PlatformId,
    pub channel_id: PlatformId,
    pub timestamp_start: UnixTimestamp,
    pub timestamp_end: UnixTimestamp,
}

/// Emoji interface produced by parsers
#[derive(Debug, Clone)]
pub struct PEmoji {
    pub id: Option<PlatformId>,
    /// e.g. "🔥", "pepe", "pepe_sad"
    pub text: String,
}

#[derive(Debug)]
#[allow(clippy::large_enum_variant)]
pub enum ParsedEntity {
    Message(PMessage),
    Call(PCall),
}

pub trait ChatParser<R: Read + Seek>
where
    Self: Sized,
{
    fn new(reader: R) -> Result<Self, Box<dyn std::error::Error>>;

    fn parse_next(&mut self) -> Result<Option<ParsedEntity>, Box<dyn std::error::Error>>;
}

pub mod discord;
pub mod json;
pub mod util;
