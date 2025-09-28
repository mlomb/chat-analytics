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
pub enum ParsedEntity {
    Guild(PGuild),
    Channel(PChannel),
    Author(PAuthor),
    Message(PMessage),
}

pub trait ChatParser {
    fn parse<R: Read + Seek>(&self, reader: R) -> Result<(), Box<dyn std::error::Error>>;
}

pub mod discord;
pub mod file;
pub mod json;
pub mod util;
