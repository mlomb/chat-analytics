use serde::Deserialize;
use std::{collections::HashMap, io::Read};
use struson::{
    reader::{JsonReader, JsonStreamReader, ValueType},
    serde::DeserializerError,
};

type Error = Box<dyn std::error::Error>;

type CallbackBox<'a, R> = Box<dyn FnMut(&mut JsonStreamReader<R>) -> Result<(), Error> + 'a>;

/// A streaming JSON abstraction that allows you to register callbacks for specific root level keys.
pub struct JSONStreamHelper<'a, R: Read> {
    callbacks: HashMap<String, CallbackBox<'a, R>>,
}

impl<'a, R: Read> Default for JSONStreamHelper<'a, R> {
    fn default() -> Self {
        Self {
            callbacks: HashMap::new(),
        }
    }
}

impl<'a, R: Read> JSONStreamHelper<'a, R> {
    /// Registers a callback to be called when a specific JSON key is encountered in the root level.
    /// If the key contains an array, the callback will be invoked for each object in the array.
    ///
    /// ```rust
    /// use serde::Deserialize;
    /// use std::io::Cursor;
    /// use pipeline_rs::parse::json::JSONStreamHelper;
    ///
    /// #[derive(Deserialize)]
    /// struct Message {
    ///     id: String,
    ///     content: String,
    /// }
    ///
    /// let json_data = r#"{
    ///     "messages": [
    ///         {"id": "1", "content": "Hello"},
    ///         {"id": "2", "content": "World"}
    ///     ]
    /// }"#;
    ///
    /// let mut count = 0;
    ///
    /// JSONStreamHelper::default()
    ///     .on_object::<Message>("messages", |message| {
    ///         count += 1;
    ///         Ok(())
    ///     })
    ///     .run(Cursor::new(json_data))
    ///     .unwrap();
    ///
    /// assert_eq!(count, 2);
    /// ```
    pub fn on_object<T: Deserialize<'a>>(
        &mut self,
        key: &str,
        mut callback: impl FnMut(Result<T, DeserializerError>) -> Result<(), Error> + 'a,
    ) -> &mut Self {
        self.callbacks.insert(
            key.to_string(),
            Box::new(move |json_reader: &mut JsonStreamReader<R>| {
                // Note that `deserialize_next` returns a Result that we pass to the callback.
                // Then the callback returns a Result, that we pass back to the `run` function.
                // This way, the consumer can decide if an error parsing is critical or can be ignored.
                callback(json_reader.deserialize_next())
            }),
        );
        self
    }

    /// Processes the JSON stream with the registered callbacks.
    pub fn run(&mut self, reader: R) -> Result<(), Error> {
        let mut json_reader = JsonStreamReader::new(reader);

        // top-level must be an object
        json_reader.begin_object()?;

        // iterate over top level keys
        while json_reader.has_next()? {
            let key = json_reader.next_name_owned()?;
            let mut callback = self.callbacks.get_mut(&key);

            match json_reader.peek()? {
                ValueType::Array if callback.is_some() => {
                    json_reader.begin_array()?;

                    let callback = callback.take().unwrap();

                    // consume each array object
                    while json_reader.has_next()? {
                        callback(&mut json_reader)?;
                    }

                    json_reader.end_array()?;
                }
                ValueType::Object if callback.is_some() => callback.unwrap()(&mut json_reader)?,

                // skip value for:
                //  - unregistered keys
                //  - non object/array values
                _ => json_reader.skip_value()?,
            }
        }

        json_reader.end_object()?;

        Ok(())
    }
}
