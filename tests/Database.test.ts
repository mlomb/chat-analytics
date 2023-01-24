import { loadNodeAsset } from "@lib/NodeEnv";
import { generateDatabase } from "@lib/index";
import { wrapStringAsFile } from "@pipeline/File";

// prettier-ignore
const TEST_CHAT = [
    `1/1/21, 12:00 - A: Hi`,
    "1/1/21, 12:01 - B: Whats up?",
    "1/1/21, 12:02 - A: All good"
].join("\n");

test("simple example", async () => {
    const db = await generateDatabase(
        [wrapStringAsFile(TEST_CHAT)],
        { platform: "whatsapp" },
        { loadAsset: loadNodeAsset }
    );
    expect(db.authors.length).toBe(2);
    expect(db.channels[0].name).toBe("A & B");
});
