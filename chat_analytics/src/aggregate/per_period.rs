use chrono_tz::Tz;
use serde::{Deserialize, Serialize};

use crate::{aggregate::Block, datetime_index::DateTimeIndex, process::database::FullDatabase};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessagesPerPeriod {
    /// Number of messages sent per day
    per_day: Vec<usize>,
    /// Number of messages sent per week
    per_week: Vec<usize>,
    /// Number of messages sent per month
    per_month: Vec<usize>,
}

impl Block for MessagesPerPeriod {
    fn compute(database: &FullDatabase) -> Self {
        let max_idxs = DateTimeIndex::from(
            database.min_timestamp,
            database.max_timestamp,
            Tz::America__Argentina__Buenos_Aires,
        );
        let mut per_day = vec![0; max_idxs.day_index + 1];
        let mut per_week = vec![0; max_idxs.week_index + 1];
        let mut per_month = vec![0; max_idxs.month_index + 1];

        for message in &database.messages {
            let message_idxs = DateTimeIndex::from(
                database.min_timestamp,
                message.timestamp,
                Tz::America__Argentina__Buenos_Aires,
            );
            per_day[message_idxs.day_index] += 1;
            per_week[message_idxs.week_index] += 1;
            per_month[message_idxs.month_index] += 1;
        }

        Self {
            per_day,
            per_week,
            per_month,
        }
    }
}
