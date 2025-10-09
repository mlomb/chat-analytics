use serde::Deserialize;
use std::io::{Read, Seek, SeekFrom};
use struson::reader::{JsonReader, JsonStreamReader, ValueType};

pub fn read_top_level_key<'a, T: Deserialize<'a>, R: Read + Seek>(
    reader: &mut R,
    key: &str,
) -> Result<T, Box<dyn std::error::Error>> {
    // start reading from the top of the file
    reader.seek(SeekFrom::Start(0))?;

    let mut stream = JsonStreamReader::new(reader);

    // we don't use `seek_to` because we want to stop reading when we find an array!

    // top-level must be an object
    stream.begin_object().expect("top level object expected");

    // iterate over top level keys forwards
    while stream.has_next()? {
        if key == stream.next_name_owned()? {
            // match!
            return Ok(stream.deserialize_next::<T>()?);
        }

        match stream.peek()? {
            ValueType::Array => {
                // stop looking, we expect big arrays at the top level
                break;
            }
            // any other case, keep looking
            _ => stream.skip_value()?,
        }
    }

    // TODO: iterate keys backwards

    Err(Box::new(std::io::Error::other(format!(
        "key {key} not found in JSON"
    ))))
}
