import fs from "fs";
import path from "path";

import { FileInput } from "@pipeline/Types";
import { generateReport } from "@pipeline/Generation";

const fileNames = fs.readdirSync(path.resolve(__dirname, "../assets/demo"));
const files: FileInput[] = fileNames.map((file) => ({
    name: file,
    text: () =>
        new Promise<string>((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, "../assets/demo", file), { encoding: "utf-8" }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        }),
}));

(async () => {
    const gen = generateReport(files, {
        platform: "whatsapp",
    });
    let last: string = "";
    for await (const packet of gen) {
        switch (packet.type) {
            case "new":
                last = packet.title;
                break;
            case "done":
                console.log(last);
                break;
            case "result":
                const dir = path.resolve(__dirname, "../dist");
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(path.resolve(dir, "demo.html"), packet.html, { encoding: "utf-8" });
                console.log('Written "dist/demo.html"');
                return;
        }
    }
})();
