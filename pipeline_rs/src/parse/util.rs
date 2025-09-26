use chrono::DateTime;
use regex::Regex;
use std::io::{Read, Seek, SeekFrom};

pub type UnixTimestamp = i64;

/// Tries to find a timestamp at the end of a file, using the provided regex. The regex must have a capture group.
/// It can detect ISO 8601 dates and unix timestamps.
///
/// This is useful to compute how up-to-date a file is before parsing it, so we can always keep the latest information (e.g. pictures, nicknames)
///
/// ```
/// use regex::Regex;
/// use std::io::Cursor;
///
/// let regex = Regex::new(r#""ts": (\d+)"#).unwrap();
/// let reader = Cursor::new(r#"{ "ts": 1111111111 }"#);
/// let timestamp = pipeline_rs::parse::util::try_to_find_timestamp_at_end(reader, regex).unwrap();
/// assert_eq!(timestamp, Some(1111111111));
///
/// let regex = Regex::new(r#""timestamp": ?"([0-9-:.+T]+)""#).unwrap();
/// let reader = Cursor::new(r#"{ "timestamp": "2020-07-17T17:03:14.366+00:00" }"#);
/// let timestamp = pipeline_rs::parse::util::try_to_find_timestamp_at_end(reader, regex).unwrap();
/// assert_eq!(timestamp, Some(1595005394));
/// ```
pub fn try_to_find_timestamp_at_end<R: Read + Seek>(
    mut reader: R,
    regex: Regex,
) -> Result<Option<UnixTimestamp>, Box<dyn std::error::Error>> {
    assert_eq!(
        regex.captures_len(),
        2,
        "Timestamp regex must have a capture group"
    );

    let mut buffer = Vec::new();

    // read at most the last 4KB
    let len = reader.seek(SeekFrom::End(0))? as i64;
    reader.seek(SeekFrom::End(-4096.min(len)))?;
    reader.read_to_end(&mut buffer)?;

    // parse as UTF-8 lossy, since we might start reading from an incomplete UTF-8 sequence
    let buffer = String::from_utf8_lossy(&buffer);

    // try to match
    Ok(if let Some(captures) = regex.captures_at(&buffer, 0) {
        let timestamp = captures.get(1).expect("the capture group").as_str();

        if timestamp.contains("T") {
            // try to parse as ISO 8601 date
            DateTime::parse_from_str(timestamp, "%Y-%m-%dT%H:%M:%S%.3f%z")
                .ok()
                .map(|dt| dt.timestamp() as UnixTimestamp)
        } else {
            println!("timestamp: {timestamp}");
            // try to parse as unix timestamp
            timestamp.parse::<UnixTimestamp>().ok()
        }
    } else {
        None
    })
}
