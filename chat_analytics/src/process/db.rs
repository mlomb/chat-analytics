use std::collections::HashMap;

use indexmap::IndexMap;

use crate::message::Message;
use crate::parse::{PAuthor, PChannel, PMessage, ParsedEntity, PlatformId};
use crate::process::channel_messages::ChannelMessages;
use crate::process::database::{Author, Channel, FullDatabase, Guild};
use crate::process::nlp::text::normalize_text;
use crate::process::nlp::tokenizer::{Tag, tokenize};

pub struct DatabaseBuilder {
    // data stores
    authors: IndexMap<PlatformId, PAuthor>,
    channels: IndexMap<PlatformId, PChannel>,
    words: IndexMap<String, String>,

    messages_in_channel: HashMap<PlatformId, ChannelMessages>,
    // for now, store directly here
    messages: Vec<Message>,
}

impl DatabaseBuilder {
    pub fn new() -> Self {
        Self {
            authors: IndexMap::new(),
            channels: IndexMap::new(),
            words: IndexMap::new(),
            messages_in_channel: HashMap::new(),
            messages: Vec::new(),
        }
    }

    pub fn process_message(&mut self, message: PMessage) -> Message {
        let normalized_text = tokenize(&normalize_text(
            &message.text_content.clone().unwrap_or_default(),
        ));

        let author_index = self
            .authors
            .insert_full(message.author.id.clone(), message.author.clone())
            .0;
        let channel_index = self
            .channels
            .insert_full(message.channel.id.clone(), message.channel.clone())
            .0;

        let mut words = vec![];

        for token in normalized_text {
            match token.tag {
                Tag::Word => words.push(
                    self.words
                        .insert_full(token.text.clone(), token.text.clone())
                        .0,
                ),
                _ => continue,
            }
        }

        // println!("TEXT: {:?}", message.text_content.unwrap_or_default());
        // println!("TOKENS: {normalized_text:?}");
        // println!("");

        let edited_after = message
            .timestamp_edit
            .map(|timestamp_edit| (timestamp_edit - message.timestamp) as usize / 1000);

        Message {
            author_index,
            channel_index,
            edited_after,
            words: if words.is_empty() { None } else { Some(words) },

            day_index: 0,
            second_of_day: 0,
            reply_offset: Some(0),
            lang_index: Some(0),
            sentiment: Some(0),
            emojis: Some(vec![0]),
            mentions: Some(vec![0]),
            reactions: Some(vec![0]),
            domains: Some(vec![0]),
            attachments: Some(vec![0]),
        }
    }

    pub fn push(&mut self, entity: ParsedEntity) {
        // println!("entity: {entity:?}");

        if let ParsedEntity::Message(message) = entity {
            let processed = self.process_message(message.clone());
            self.messages.push(processed);
        }
        // -
    }

    pub fn build(self) -> FullDatabase {
        FullDatabase {
            guilds: vec![Guild {
                name: "Default".to_string(),
                avatar: None,
            }],
            authors: self
                .authors
                .into_values()
                .map(|a| Author {
                    name: a.name,
                    bot: a.bot,
                    avatar: a.avatar,
                })
                .collect(),
            channels: self
                .channels
                .into_values()
                .map(|c| Channel {
                    name: c.name,
                    avatar: c.avatar,
                    msg_offset: 0,
                    msg_count: 0,
                })
                .collect(),
            messages: self.messages,
        }
    }
}
