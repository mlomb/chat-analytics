use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::parse::AttachmentType;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    // author
    pub author_index: usize,
    // TODO: to be removed
    pub channel_index: usize,

    // time
    pub timestamp: DateTime<Utc>,
    pub day_index: usize,
    pub second_of_day: usize,
    pub edited_after: Option<usize>, // seconds

    // reply
    pub reply_offset: Option<usize>,

    // analysis
    pub lang_index: Option<usize>,
    pub sentiment: Option<usize>,

    // content
    pub words: Vec<usize>,
    pub emojis: Vec<usize>,
    pub mentions: Vec<usize>,
    pub reactions: Vec<usize>,
    pub domains: Vec<usize>,
    pub attachments: Vec<AttachmentType>,
}
