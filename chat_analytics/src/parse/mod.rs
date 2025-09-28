use std::io::{Read, Seek};

#[derive(Debug)]
struct PGuild {
    id: String,
    name: String,
}

#[derive(Debug)]
struct PChannel {
    id: String,
    name: String,
}

#[derive(Debug)]
struct PAuthor {
    id: String,
    name: String,
}

#[derive(Debug)]
struct PMessage {
    id: String,
    content: String,
}

#[derive(Debug)]
struct PCall {
    id: String,
    authorId: String,
    channelId: String,
    timestampStart: String,
    timestampEnd: String,
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
}

pub mod discord;
pub mod file;
pub mod json;
pub mod util;
