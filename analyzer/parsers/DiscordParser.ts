import { Parser } from "../Parser";
import { Author, Channel, Database, Message, ID } from "../Types";

export class DiscordParser extends Parser {
    parse(files: string[]): Database {
        let channels: Channel[] = [];
        let authors: Map<ID, Author> = new Map();
        let guild: any;
        for (let file_content of files) {
            let data = JSON.parse(file_content);
            console.log(data);
            let channel: Channel = {
                id: data.channel.id,
                name: data.channel.name,
                messages: [],
            };
            for (let msg of data.messages) {
                if (msg.type == "Default") {
                    channel.messages.push({
                        type: "message",
                        author: msg.author.id,
                        date: new Date(msg.timestamp),
                        content: msg.content,
                    });
                } else {
                    // console.log("Unhandled type", msg.type);
                }
                if (!authors.has(msg.author.id)) {
                    let author: Author = {
                        id: msg.author.id,
                        name: msg.author.nickname,
                        bot: msg.author.isBot,
                        discord: {
                            // @ts-ignore
                            discriminator: msg.author.discriminator % 5,
                        },
                    };
                    if (msg.author.avatarUrl) {
                        // TODO: make sure size is 32px
                        author.avatarUrl = msg.author.avatarUrl;
                    }
                    if (msg.author.color) author.color = msg.author.color;
                    authors.set(msg.author.id, author);
                }

                // TODO: check if mixing guilds
                guild = data.guild;
            }
            channels.push(channel);
        }

        return {
            platform: "discord",
            title: guild.name,
            channels,
            authors,
        };
    }
}
