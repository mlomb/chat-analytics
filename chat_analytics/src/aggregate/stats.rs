use chrono::{Datelike, Timelike};
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use std::collections::HashMap;

use crate::{aggregate::Block, parse::AttachmentType, process::database::FullDatabase};

#[serde_as]
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessagesStats {
    /// Total number of messages sent
    pub total: usize,
    /// Total number of messages edited
    pub edited: usize,

    /// Number of messages that contain text
    pub with_text: usize,
    /// Number of messages that contain links
    pub with_links: usize,
    /// Number of messages that contain attachments of each type
    pub with_attachments_count: HashMap<AttachmentType, usize>,

    /// Number of messages sent by each author
    pub counts_by_author: Vec<usize>,
    /// Number of messages sent in each channel
    pub counts_in_channel: Vec<usize>,

    /// Number of active days given the time filter
    pub num_active_days: usize,
    /// Each entry contains the number of messages sent for that hour of the week
    #[serde_as(as = "[_; 7 * 24]")]
    pub weekday_hour_activity: [usize; 7 * 24],

    pub most_active_hour: MostActiveEntry,
    pub most_active_day: MostActiveEntry,
    pub most_active_month: MostActiveEntry,
    pub most_active_year: MostActiveEntry,
}

/** Most active entry with count and optional timestamp */
#[derive(Debug, Serialize, Deserialize)]
pub struct MostActiveEntry {
    pub messages: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub at: Option<i64>, // Datetime as timestamp
}

impl Block for MessagesStats {
    fn compute(database: FullDatabase) -> Self {
        let mut total = 0;
        let mut edited = 0;
        let mut with_text = 0;
        let mut with_links = 0;
        let mut with_attachments_count = HashMap::new();

        let mut counts_by_author = vec![0; database.authors.len()];
        let mut counts_in_channel = vec![0; database.channels.len()];

        let mut weekday_hour_activity = [0; 7 * 24];

        for message in database.messages {
            total += 1;
            if !message.words.is_empty() {
                with_text += 1
            }
            if !message.domains.is_empty() {
                with_links += 1;
            }
            if message.edited_after.is_some() {
                edited += 1;
            }
            for attachment in message.attachments {
                with_attachments_count
                    .entry(attachment)
                    .and_modify(|count| *count += 1)
                    .or_insert(1);
            }
            counts_by_author[message.author_index] += 1;
            counts_in_channel[message.channel_index] += 1;

            // extract day from timestamp
            let weekday = message.timestamp.weekday();
            let hour_of_day = message.timestamp.time().hour();

            weekday_hour_activity[(weekday.num_days_from_monday() * 24 + hour_of_day) as usize] +=
                1;
        }

        Self {
            total,
            edited,
            with_text,
            with_links,
            with_attachments_count,

            counts_by_author,
            counts_in_channel,

            // TODO:
            num_active_days: 0,
            weekday_hour_activity,
            most_active_hour: MostActiveEntry {
                messages: 0,
                at: None,
            },
            most_active_day: MostActiveEntry {
                messages: 0,
                at: None,
            },
            most_active_month: MostActiveEntry {
                messages: 0,
                at: None,
            },
            most_active_year: MostActiveEntry {
                messages: 0,
                at: None,
            },
        }
    }
}
