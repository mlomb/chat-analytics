use std::collections::HashMap;

use crate::message::Message;
use crate::parse::{PAuthor, PChannel, PMessage, ParsedEntity, RawID};
use crate::process::channel_messages::ChannelMessages;
use crate::process::nlp::text::{self, normalize_text};
use crate::process::nlp::tokenizer::{self, tokenize};

pub struct Database {
    authors: HashMap<RawID, PAuthor>,
    channels: HashMap<RawID, PChannel>,
    messages_in_channel: HashMap<RawID, ChannelMessages>,
    // for now, store directly here
    messages: Vec<Message>,
}

impl Database {
    pub fn new() -> Self {
        Self {
            authors: HashMap::new(),
            channels: HashMap::new(),
            messages_in_channel: HashMap::new(),
            messages: Vec::new(),
        }
    }

    pub fn process_message(&mut self, message: PMessage) -> Message {
        let normalized_text = tokenize(&normalize_text(
            &message.text_content.clone().unwrap_or_default(),
        ));

        println!("TEXT: {:?}", message.text_content.unwrap_or_default());
        println!("TOKENS: {normalized_text:?}");
        println!("");
        //
        Message {
            day_index: 0,
            second_of_day: 0,
            edited_after: Some(0),
            author_index: 0,
            reply_offset: Some(0),
            lang_index: Some(0),
            sentiment: Some(0),
            words: Some(vec![0]),
            emojis: Some(vec![0]),
            mentions: Some(vec![0]),
            reactions: Some(vec![0]),
            domains: Some(vec![0]),
            attachments: Some(vec![0]),
        }
    }

    pub fn push(&mut self, entity: ParsedEntity) {
        // println!("entity: {entity:?}");

        match entity {
            ParsedEntity::Message(message) => {
                self.authors
                    .insert(message.author.id.clone(), message.author.clone());
                self.channels
                    .insert(message.channel.id.clone(), message.channel.clone());

                let processed = self.process_message(message.clone());
                self.messages.push(processed);

                self.messages_in_channel
                    .entry(message.channel.id.clone())
                    .or_insert_with(ChannelMessages::default)
                    .add_message(message);
            }
            _ => {}
        }
        // -
    }
}
