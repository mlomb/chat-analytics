use chrono::{Datelike, TimeZone, Timelike};
use chrono_tz::Tz;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use std::collections::HashMap;

use crate::{
    aggregate::Block, parse::AttachmentType, process::database::FullDatabase, time_index::TimeIndex,
};

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
        let ti = TimeIndex::new(database.min_timestamp, Tz::America__Argentina__Buenos_Aires);

        println!("ti: {:?}", ti.index(database.min_timestamp));

        let mut total = 0;
        let mut edited = 0;
        let mut with_text = 0;
        let mut with_links = 0;
        let mut with_attachments_count = HashMap::new();

        let mut counts_by_author = vec![0; database.authors.len()];
        let mut counts_in_channel = vec![0; database.channels.len()];

        let max_idxs = ti.index(database.max_timestamp);
        let mut day_counts = vec![0; max_idxs.day_index + 1];
        let mut month_counts = vec![0; max_idxs.month_index + 1];
        let mut year_counts = vec![0; max_idxs.year_index + 1];
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

            let message_idxs = ti.index(message.timestamp);

            day_counts[message_idxs.day_index] += 1;
            month_counts[message_idxs.month_index] += 1;
            year_counts[message_idxs.year_index] += 1;
            weekday_hour_activity[message_idxs.weekday_index * 24 + message_idxs.hour_index] += 1;
        }

        Self {
            total,
            edited,
            with_text,
            with_links,
            with_attachments_count,

            counts_by_author,
            counts_in_channel,

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
