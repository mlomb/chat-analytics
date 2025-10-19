pub mod per_period;
pub mod stats;

use crate::process::database::FullDatabase;

pub struct BlockFilters {
    /// List of author indices to include. If empty, means all authors are included.
    authors: Vec<usize>, // TODO: replace by bitset
    /// List of channel indices to include. If empty, means all channels are included.
    channels: Vec<usize>,

    /// Start date to include.
    start_date: usize,
    /// End date to include.
    end_date: usize,
}

pub trait Block {
    fn compute(database: &FullDatabase) -> Self;
}
