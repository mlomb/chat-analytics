pub mod per_period;
pub mod stats;

use crate::process::database::FullDatabase;

pub trait Block {
    fn compute(database: &FullDatabase) -> Self;
}
