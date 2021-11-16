import { ID } from "@pipeline/Types";
import { Author, Channel } from "@pipeline/parse/Database";
import { ParseFn } from "@pipeline/parse/Parse";
import { DiscordExportFile } from "@pipeline/parse/DiscordParser.d";

export const parse: ParseFn = (files: string[]) => {
    let channels: Map<ID, Channel> = new Map();
    let authors: Map<ID, Author> = new Map();
    let title = "Discord Server";

    for (let file_content of files) {
        let data = JSON.parse(file_content) as DiscordExportFile;
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
                        discriminator: parseInt(msg.author.discriminator) % 5,
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
            channels.set(channel.id, channel);

            title = data.guild.name;
        }
    }

    return {
        platform: "discord",
        title,
        channels,
        authors,
    };
};
