use clap::Parser;
use clap::ValueEnum;
use pipeline_rs::parse::ChatParser;
use std::fs::File;

use pipeline_rs::parse::discord::DiscordParser;

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

    let parser = DiscordParser::default();
    parser.parse(file).expect("Failed to parse file");

    Ok(())
}
