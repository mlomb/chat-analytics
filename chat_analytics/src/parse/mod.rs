use std::io::{Read, Seek};

/// Platform's own ID (e.g: a Discord Snowflake)
pub type RawID = String;

pub type UnixTimestamp = i64;

/// Guild interface produced by parsers
#[derive(Debug, Clone)]
pub struct PGuild {
    id: String,
    name: String,
    avatar: Option<String>,
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
#[derive(Debug)]
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
    id: RawID,
    guild: PGuild,
    r#type: ChannelType,
    name: String,
    avatar: Option<String>,
}

/// Author interface produced by parsers
#[derive(Debug)]
pub struct PAuthor {
    id: RawID,
    name: String,
    bot: bool,
    avatar: Option<String>,
}

/// Message interface produced by parsers
#[derive(Debug)]
pub struct PMessage {
    id: RawID,
    channel: PChannel,
    author: PAuthor,
    timestamp: UnixTimestamp,
    timestamp_edit: Option<UnixTimestamp>,
    reply_to: Option<RawID>,

    text_content: Option<String>,
    attachments: Vec<AttachmentType>,
    reactions: Vec<(PEmoji, u32)>,
}

#[derive(Debug)]
pub struct PCall {
    id: RawID,
    /// The user who started the call
    author_id: RawID,
    channel_id: RawID,
    timestamp_start: UnixTimestamp,
    timestamp_end: UnixTimestamp,
}

/// Emoji interface produced by parsers
#[derive(Debug)]
pub struct PEmoji {
    id: Option<RawID>,
    /// e.g. "🔥", "pepe", "pepe_sad"
    text: String,
}

#[derive(Debug)]
pub enum ParsedEntity {
    A,
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
