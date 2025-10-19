use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::message::Message;

#[derive(Debug, Serialize, Deserialize)]
pub struct Guild {
    pub name: String,
    pub avatar: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Channel {
    pub name: String,
    pub avatar: Option<String>,

    pub msg_offset: u64,
    pub msg_count: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Author {
    pub name: String,
    pub bot: bool,
    pub avatar: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FullDatabase {
    pub guilds: Vec<Guild>,
    pub channels: Vec<Channel>,
    pub authors: Vec<Author>,
    pub messages: Vec<Message>,

    pub min_timestamp: DateTime<Utc>,
    pub max_timestamp: DateTime<Utc>,
}
