import { Parser } from "../Parser";
import { Channel, Database, Message } from "../Types";

export class DiscordParser extends Parser {

    parse(files: string[]): Database {
        let channels: Channel[] = [];
        for(let file_content of files) {
            let data = JSON.parse(file_content);
            let channel: Channel = {
                id: data.channel.id,
                name: data.channel.name,
                messages: data.messages.map((msg:any) => ({
                    type: "message",
                    date: new Date(msg.timestamp),
                    content: msg.content
                }))
            };
            channels.push(channel);
        }
        return {
            platform: "discord",
            channels,
            authors: []
        };
    }

}
