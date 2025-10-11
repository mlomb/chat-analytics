use chrono::{DateTime, Datelike, Timelike, Utc};
use chrono_tz::Tz;

pub struct TimeIndex {
    start: DateTime<Tz>,
    time_zone: Tz,
}

// TODO: refactor into DateIndex with just one compute function (start/end)

#[derive(Debug, Clone)]
pub struct DateIndex {
    pub year_index: usize,
    pub month_index: usize,
    pub day_index: usize,
    pub weekday_index: usize,
    pub hour_index: usize,
}

impl TimeIndex {
    pub fn new(start: DateTime<Utc>, time_zone: Tz) -> Self {
        Self {
            start: start.with_timezone(&time_zone),
            time_zone,
        }
    }

    pub fn index(&self, end: DateTime<Utc>) -> DateIndex {
        let end = end.with_timezone(&self.time_zone);

        let start_date = self.start.date_naive();
        let end_date = end.date_naive();
        let end_time = end.time();

        let duration = end_date - start_date;
        let interval_year = end_date.year() as i64 - start_date.year() as i64;
        let interval_month = end_date.month0() as i64 - start_date.month0() as i64;

        DateIndex {
            year_index: interval_year as usize,
            month_index: (interval_month + interval_year * 12) as usize,
            day_index: duration.num_days() as usize,
            weekday_index: end.weekday().num_days_from_monday() as usize,
            hour_index: end_time.hour() as usize,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    /// Shorthand for cleaner tests
    ///
    /// Uses the UTC 2000's april fools as the start date
    fn get_index(date: &str) -> DateIndex {
        TimeIndex::new(
            // 2000's april fools
            DateTime::<Utc>::from_str("2000-04-01T00:00:00Z").unwrap(),
            Tz::UTC,
        )
        .index(DateTime::<Utc>::from_str(date).expect("valid test date"))
    }

    #[test]
    fn correct_zero() {
        let idxs = get_index("2000-04-01T00:00:00Z");

        assert_eq!(idxs.year_index, 0);
        assert_eq!(idxs.month_index, 0);
        assert_eq!(idxs.day_index, 0);
    }

    #[test]
    fn correct_year_index() {
        assert_eq!(get_index("2001-07-06T00:00:00Z").year_index, 1);
        assert_eq!(get_index("2020-02-03T00:00:00Z").year_index, 20);
        assert_eq!(get_index("2020-02-05T00:00:00Z").year_index, 20);
    }

    #[test]
    fn correct_month_index() {
        assert_eq!(get_index("2001-07-06T00:00:00Z").month_index, 15);
        assert_eq!(get_index("2020-02-03T00:00:00Z").month_index, 238);
        assert_eq!(get_index("2020-02-05T00:00:00Z").month_index, 238);
    }

    #[test]
    fn correct_day_index() {
        assert_eq!(get_index("2001-07-06T00:00:00Z").day_index, 461);
        assert_eq!(get_index("2020-02-03T00:00:00Z").day_index, 7247);
        assert_eq!(get_index("2020-02-05T00:00:00Z").day_index, 7249);
    }
}
