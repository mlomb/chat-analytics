use chat_analytics::aggregate::Block;
use chat_analytics::aggregate::per_period::MessagesPerPeriod;
use chat_analytics::aggregate::stats::MessagesStats;
use chat_analytics::process::database::FullDatabase;
use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use std::panic;

static mut STATIC_DATABASE: Option<FullDatabase> = None;

#[wasm_bindgen]
pub fn init_panic_hook() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
pub fn read_database(encoded_database: &[u8]) {
    // Print encoded_database size
    web_sys::console::log_1(
        &format!("encoded_database size: {} bytes", encoded_database.len()).into(),
    );

    // Decode the bincode-encoded database using bincode trait
    let (database, _): (FullDatabase, usize) =
        bincode::serde::decode_from_slice(encoded_database, bincode::config::standard())
            .expect("Failed to decode database");

    unsafe {
        STATIC_DATABASE = Some(database);
    }
}

#[wasm_bindgen]
pub fn compute_block(key: String, args: String) -> Result<String, String> {
    let database = unsafe {
        (*std::ptr::addr_of!(STATIC_DATABASE))
            .as_ref()
            .expect("Database not initialized")
    };

    let result = match key.as_str() {
        "messages/stats" => serde_json::to_string(&MessagesStats::compute(database)),
        "messages/per-period" => serde_json::to_string(&MessagesPerPeriod::compute(database)),
        _ => return Err(format!("BlockFn not found for key: {}", key)),
    };

    result.map_err(|e| format!("Failed to convert to JSON: {}", e))
}
