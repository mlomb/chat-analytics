use crate::message::Message;

#[derive(Debug)]
pub struct Guild {
    pub name: String,
    pub avatar: Option<String>,
}

#[derive(Debug)]
pub struct Channel {
    pub name: String,
    pub avatar: Option<String>,

    pub msg_offset: u64,
    pub msg_count: u64,
}

#[derive(Debug)]
pub struct Author {
    pub name: String,
    pub bot: bool,
    pub avatar: Option<String>,
}

#[derive(Debug)]
pub struct FullDatabase {
    pub guilds: Vec<Guild>,
    pub channels: Vec<Channel>,
    pub authors: Vec<Author>,
    pub messages: Vec<Message>,
}
