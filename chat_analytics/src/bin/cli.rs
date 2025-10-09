use chat_analytics::aggregate::Block;
use clap::Parser;
use clap::ValueEnum;
use indicatif::{ProgressBar, ProgressStyle};
use std::fs::File;

use chat_analytics::aggregate::stats::MessagesStats;
use chat_analytics::parse::ChatParser;
use chat_analytics::parse::discord::DiscordChatExporterParser;
use chat_analytics::process::db::DatabaseBuilder;
use chat_analytics::progress_reader::ProgressReader;

#[derive(ValueEnum, Debug, Clone)]
#[value(rename_all = "lower")]
enum Platform {
    WhatsApp,
    Discord,
    Telegram,
}

#[derive(Parser, Debug)]
#[command(author, version, about = "The chat analysis tool", long_about = None)]
struct Args {
    /// Chat export format
    #[arg(short, long)]
    platform: Platform,

    /// Export files or folders.
    /// If a folder is provided, all files inside will be used
    #[arg(required = true)]
    files: Vec<String>,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    println!("args: {args:?}");

    let file = File::open(args.files[0].clone())?;
    let file_size = file.metadata()?.len();
    let (file_wrapper, bytes_read) = ProgressReader::new(file);

    let mut parser = DiscordChatExporterParser::new(file_wrapper)?;
    let mut database = DatabaseBuilder::new();

    let mut count = 0;

    let bar = ProgressBar::new(file_size);
    bar.set_style(ProgressStyle::with_template("{bytes} / {total_bytes} ({eta})").unwrap());

    while let Some(entity) = parser.parse_next()? {
        database.push(entity);
        count += 1;
        bar.set_position(*bytes_read.borrow());
    }

    bar.finish();

    println!("count: {count}");

    let full_database = database.build();
    // println!("full_database: {full_database:?}");

    let messages_stats = MessagesStats::compute(full_database);
    println!("messages_stats: {messages_stats:?}");

    Ok(())
}
