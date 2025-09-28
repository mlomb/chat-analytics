use crate::parse::json::read_top_level_key;
use crate::parse::{ChatParser, ParsedEntity};
use ::serde::Deserialize;
use std::io::{Read, Seek, SeekFrom};
use struson::json_path;
use struson::reader::{JsonReader, JsonStreamReader};

#[derive(Debug)]
pub struct DiscordParser<R: Read + Seek> {
    json_stream: JsonStreamReader<R>,
}

#[derive(Debug, Deserialize, Default)]
struct DiscordGuild {
    id: String,
    name: String,
}

#[derive(Debug, Deserialize, Default)]
struct DiscordChannel {
    id: String,
    name: String,
}

#[derive(Debug, Deserialize, Default)]
struct DiscordMessage {
    id: String,
    content: String,
}

impl<R: Read + Seek> ChatParser<R> for DiscordParser<R> {
    fn new(mut reader: R) -> Result<Self, Box<dyn std::error::Error>> {
        let guild: DiscordGuild = read_top_level_key(&mut reader, "guild")?;
        let channel: DiscordChannel = read_top_level_key(&mut reader, "channel")?;

        println!("guild: {guild:?}");
        println!("channel: {channel:?}");

        // reset reader
        reader.seek(SeekFrom::Start(0))?;

        // create & seek to messages key
        let mut stream = JsonStreamReader::new(reader);
        stream.seek_to(&json_path!["messages"])?;
        stream.begin_array()?;

        Ok(Self {
            json_stream: stream,
        })
    }
}

impl<R: Read + Seek> Iterator for DiscordParser<R> {
    type Item = Result<Option<ParsedEntity>, Box<dyn std::error::Error>>;

    fn next(&mut self) -> Option<Self::Item> {
        if self.json_stream.has_next().unwrap() {
            let message: DiscordMessage = self.json_stream.deserialize_next().unwrap();
            Some(Ok(Some(ParsedEntity::A)))
        } else {
            None
        }
    }
}
