import { unzipSync } from "fflate";
// There is a convenient parser already out there
import { parseStringSync } from "whatsapp-chat-parser";

import { AttachmentType } from "@pipeline/Attachments";
import { FileInput } from "@pipeline/parse/File";
import { Parser } from "@pipeline/parse/Parser";
import { extractChatName, isGroupWelcome, matchAttachmentType, removeBadChars } from "@pipeline/parse/parsers/WhatsApp";

export class WhatsAppParser extends Parser {
    private channelIndex = 0;
    private messageIndex = 0;

    /** Parse a WhatsApp export in txt or zip format */
    async *parse(file: FileInput) {
        const fileBuffer = await file.slice();

        // regular .txt or .zip file
        const txtBuffer = file.name.toLowerCase().endsWith(".zip") ? this.extractTxtFromZip(fileBuffer) : fileBuffer;
        const fileContent = new TextDecoder("utf-8").decode(txtBuffer);

        // use whatsapp-chat-parser
        const parsed = parseStringSync(fileContent);

        // sometimes messages are out of order, make sure to sort them
        // is this something that whatsapp-chat-parser should fix?
        parsed.sort((a, b) => a.date.getTime() - b.date.getTime());

        // compute the number of authors, excluding the "System" author
        const numAuthors = new Set(parsed.filter((m) => m.author !== "System").map((m) => m.author)).size;

        // try to extract the chat name from the filename
        let name: string | undefined = extractChatName(file.name);
        // otherwise fallback to a generic name
        name = name || `WhatsApp Chat #${this.channelIndex}`;

        this.emit("guild", { id: 0, name: "WhatsApp Chats" });
        this.emit("channel", {
            id: this.channelIndex,
            guildId: 0,
            name,
            type: numAuthors > 2 ? "group" : "dm",
        });

        // NOTE: messages in ephemeral mode appear as empty messages
        for (const message of parsed) {
            const timestamp = message.date.getTime();

            // sometimes messages have these chars in them, I have no clue why
            const messageContent = removeBadChars(message.message);

            if (isGroupWelcome(messageContent)) {
                // Skip "Messages and calls are end-to-end encrypted..."
                continue;
            }

            if (message.author === "System") {
                // parse system messages?
            } else {
                this.emit("author", {
                    id: message.author,
                    name: message.author,
                    bot: false,
                });

                let attachment: AttachmentType | undefined = matchAttachmentType(messageContent);

                // location attachment
                // we should handle this better
                // examples:
                // Ubicación: https://maps.google.com/?q=-XX.XXXXXX,-XX.XXXXXX
                // location: https://maps.google.com/?q=-XX.XXXXXX,-XX.XXXXXX
                // TODO: create attachment type for location?
                if (messageContent.includes("https://maps.google.com/?q=")) attachment = AttachmentType.Other;

                // TODO: handle "live location shared"
                // TODO: handle deleted messages?

                this.emit("message", {
                    id: this.messageIndex++,
                    authorId: message.author,
                    channelId: this.channelIndex,
                    timestamp,
                    textContent: attachment === undefined ? messageContent : undefined,
                    attachments: attachment === undefined ? [] : [attachment],
                });
            }
        }

        this.channelIndex++;
    }

    /**
     * Tries to extract a .txt file from a .zip file buffer.
     * It searches the default "_chat.txt" file. Otherwise tries to match some text files with a pattern.
     *
     * @throws if it can't find a .txt file
     * @returns the .txt file buffer
     */
    extractTxtFromZip(fileBuffer: ArrayBuffer): ArrayBuffer {
        if (fileBuffer.byteLength > 300 * 1024 * 1024)
            throw new Error("Do not attach media files while exporting (file too big)");

        const unzippedFiles = unzipSync(new Uint8Array(fileBuffer));
        const files = Object.keys(unzippedFiles);

        // by default is included as "_chat.txt" inside the ZIP
        if (files.includes("_chat.txt")) {
            return unzippedFiles["_chat.txt"];
        } else {
            // otherwise we try to find a file that matches the pattern
            // (defensive, just in case)
            const chatTxtFiles = files
                .filter((f) => f.match(/.*(?:chat|whatsapp).*\.txt$/i))
                .sort((a, b) => a.length - b.length);
            if (chatTxtFiles.length > 0) return unzippedFiles[chatTxtFiles[0]];
        }

        throw new Error("Could not find txt file in zip");
    }
}
