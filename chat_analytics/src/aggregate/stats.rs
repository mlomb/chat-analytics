use serde::{Deserialize, Serialize};

use crate::{aggregate::Block, process::database::FullDatabase};

#[derive(Debug, Serialize, Deserialize)]
pub struct MessagesStats {
    /// Total number of messages sent
    pub total: usize,
    /// Total number of messages edited
    pub edited: usize,

    /// Number of messages edited by each author
    pub counts_authors: Vec<usize>,
    /// Number of messages edited in each channel
    pub counts_channels: Vec<usize>,
}

impl Block for MessagesStats {
    fn compute(database: FullDatabase) -> Self {
        Self {
            total: database.messages.len(),
            edited: 0,
            counts_authors: vec![0; database.authors.len()],
            counts_channels: vec![0; database.channels.len()],
        }
    }
}
