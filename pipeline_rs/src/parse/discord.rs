use crate::parse::{ChatParser, json::JSONStreamHelper};
use ::serde::Deserialize;
use std::io::Read;

#[derive(Default, Debug)]
pub struct DiscordParser {}

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

impl ChatParser for DiscordParser {
    fn parse<R: Read>(&self, reader: R) -> Result<(), Box<dyn std::error::Error>> {
        let mut count = 0;
        JSONStreamHelper::default()
            .on_object::<DiscordGuild>("guild", |guild| Ok(println!("guild: {guild:?}")))
            .on_object::<DiscordChannel>("channel", |channel| Ok(println!("channel: {channel:?}")))
            .on_object::<DiscordMessage>("messages", {
                let count = &mut count;
                move |message| {
                    println!("msg: {message:?}");
                    *count += 1;
                    Ok(())
                }
            })
            .run(reader)?;

        println!("count: {count}");

        Ok(())
    }
}
