use chat_analytics::aggregate::stats::MessagesStats;
use chat_analytics::aggregate::Block;
use chat_analytics::parse::discord::DiscordChatExporterParser;
use chat_analytics::parse::ChatParser;
use chat_analytics::process::db::DatabaseBuilder;
use wasm_bindgen::prelude::*;
use wasm_bindgen_file_reader::WebSysFile;
extern crate console_error_panic_hook;
use std::io::BufReader;
use std::panic;

#[wasm_bindgen]
pub fn init_panic_hook() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
pub fn process_files(files: Vec<web_sys::File>) -> String {
    let mut sum = 0;

    for file in &files {
        sum += file.size() as usize;
    }

    let mut database = DatabaseBuilder::new();

    for file in &files {
        let wf = WebSysFile::new(file.clone());

        // wrap wf in a bufferedreader to avoid small reads
        const BUFFER_SIZE: usize = 1024 * 1024 * 4; // 4MB
        let wf = BufReader::with_capacity(BUFFER_SIZE, wf);

        let parser = DiscordChatExporterParser::new(wf).expect("Failed to parse file");

        let mut count = 0;

        for result in parser {
            database.push(result.expect("Failed to parse message"));
            count += 1;
        }
    }

    let full_database = database.build();

    let messages_stats = MessagesStats::compute(full_database);

    // convert to JSON
    let messages_stats_json =
        serde_json::to_string(&messages_stats).expect("Failed to convert to JSON");

    messages_stats_json
}
