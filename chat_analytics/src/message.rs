#[derive(Debug, Clone)]
pub struct Message {
    // author
    pub author_index: usize,
    // TODO: to be removed
    pub channel_index: usize,

    // time
    pub day_index: usize,
    pub second_of_day: usize,
    pub edited_after: Option<usize>, // seconds

    // reply
    pub reply_offset: Option<usize>,

    // analysis
    pub lang_index: Option<usize>,
    pub sentiment: Option<usize>,

    // content
    pub words: Option<Vec<usize>>,
    pub emojis: Option<Vec<usize>>,
    pub mentions: Option<Vec<usize>>,
    pub reactions: Option<Vec<usize>>,
    pub domains: Option<Vec<usize>>,
    pub attachments: Option<Vec<usize>>,
}
