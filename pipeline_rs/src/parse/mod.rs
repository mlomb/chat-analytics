use std::io::{Read, Seek};

pub trait ChatParser {
    fn parse<R: Read + Seek>(&self, reader: R) -> Result<(), Box<dyn std::error::Error>>;
}

pub mod discord;
pub mod file;
pub mod json;
pub mod util;
