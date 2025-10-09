#[derive(Debug, Clone)]
pub struct Message {
    // time
    pub day_index: u32,
    pub second_of_day: u32,
    pub edited_after: Option<u32>,

    // author
    pub author_index: u32,

    // reply
    pub reply_offset: Option<u32>,

    // analysis
    pub lang_index: Option<u32>,
    pub sentiment: Option<u32>,

    // content
    pub words: Option<Vec<u32>>,
    pub emojis: Option<Vec<u32>>,
    pub mentions: Option<Vec<u32>>,
    pub reactions: Option<Vec<u32>>,
    pub domains: Option<Vec<u32>>,
    pub attachments: Option<Vec<u32>>,
}
