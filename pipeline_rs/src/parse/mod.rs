use std::io::Read;

pub trait ChatParser {
    fn parse<R: Read>(&self, reader: R) -> Result<(), Box<dyn std::error::Error>>;
}

pub mod discord;
pub mod file;
pub mod json;
