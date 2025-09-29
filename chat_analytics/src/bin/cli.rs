use clap::Parser;
use clap::ValueEnum;
use std::fs::File;

use chat_analytics::parse::ChatParser;
use chat_analytics::parse::discord::DiscordChatExporterParser;
use chat_analytics::process::db::Database;

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

    let parser = DiscordChatExporterParser::new(file)?;
    let mut database = Database::new();

    let mut count = 0;

    for result in parser {
        database.push(result?);
        count += 1;
    }

    println!("count: {count}");

    Ok(())
}
