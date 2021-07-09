import { Parser } from "../Parser";
import { Database, Message } from "../Types";

/*
    There is a convenient parser already out there
*/
import { parseStringSync } from "whatsapp-chat-parser";

export class WhatsAppParser extends Parser {

    parse(files: string[]): Database {
        let messages: Message[] = [];
        let authors = new Set<string>();
        for(let file_content of files) {
            let parsed = parseStringSync(file_content);
            for(let msg of parsed) {
                authors.add(msg.author);
                messages.push({
                    type: "message",
                    date: msg.date,
                    content: msg.message
                });
            }
        }

        return {
            platform: "whatsapp",
            channels: [{
                id: "",
                messages,
                name: ""
            }],
            authors: []
        };
    }

}
