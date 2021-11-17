export default null as any;

import { compress } from "compress-json";

import { Platform } from "@pipeline/Types";

import { Parser } from "@pipeline/parse/Parser";
import { DiscordParser } from "@pipeline/parse/DiscordParser";
import { WhatsAppParser } from "@pipeline/parse/WhatsAppParser";
import { TelegramParser } from "@pipeline/parse/TelegramParser";
import { analyze } from "@pipeline/Analyzer";

let reportPage: string;

var xhr = new XMLHttpRequest();
xhr.responseType = "text";
xhr.onload = () => {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status < 400) {
            reportPage = xhr.responseText;
        } else {
            throw new Error("Can't load the report page, please reload the page.");
        }
    }
};
xhr.open("GET", "report.html", true);
xhr.send();

export type WorkerResult = {
    blob: Blob;
    url: string;
};

export type StartMessage = {
    type: "start";
    platform: Platform;
    files: FileList;
};

// Report progress
export type StatusMessage = {
    type: "status";
    cosas?: any;
};

// Messages between the Worker and the Service
export type Message = StartMessage | StatusMessage;

async function start(msg: StartMessage) {
    // Load files
    const files: string[] = [];
    for (let i = 0; i < msg.files.length; i++) {
        files.push(await msg.files[i].text());
    }

    // Create parser
    let parser: Parser;
    switch (msg.platform) {
        case "discord":
            parser = new DiscordParser();
            break;
        case "whatsapp":
            parser = new WhatsAppParser();
            break;
        case "telegram":
            parser = new TelegramParser();
            break;
        default:
            return null;
    }

    // Parse files
    for (const file_content of files) {
        parser.parse(file_content);
    }
    const db = parser.database;
    console.log(db);

    // Analyze chats
    const report = analyze(db);

    const report_data = JSON.stringify(compress(report));
    console.log(report_data);

    const page = reportPage.replace("undefined", report_data);
    const blob = new Blob([page], { type: "text/html" });

    // @ts-ignore
    self.postMessage(<WorkerResult>{
        blob,
        url: URL.createObjectURL(blob),
    });
}

if (typeof window === "undefined" && typeof self !== "undefined") {
    console.log("Web Worker started");

    // This should only run inside the Web Worker
    self.onmessage = (ev: MessageEvent<Message>) => {
        if (ev.data.type === "start") {
            start(ev.data);
        }
    };
} else {
    console.error("What");
}
