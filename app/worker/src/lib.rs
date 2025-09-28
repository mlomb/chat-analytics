use chat_analytics::parse::discord::DiscordParser;
use chat_analytics::parse::ChatParser;
use wasm_bindgen::prelude::*;
use wasm_bindgen_file_reader::WebSysFile;
extern crate console_error_panic_hook;
use std::panic;

#[wasm_bindgen]
pub fn init_panic_hook() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
pub fn process_files(files: Vec<web_sys::File>) -> usize {
    let mut sum = 0;

    for file in &files {
        sum += file.size() as usize;
    }

    let wf = WebSysFile::new(files[0].clone());

    let parser = DiscordParser::default();
    parser.parse(wf).expect("Failed to parse file");

    sum
}
