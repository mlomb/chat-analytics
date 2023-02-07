import { compressDatabase, decompressDatabase } from "@pipeline/compression/Compression";
import { generateDatabase } from "@pipeline/index";

import { TestEnv, loadSamples } from "@tests/samples";

test("should compress and decompress correctly", async () => {
    const samples = await loadSamples(["discord/GC_3A_5M.json", "discord/SV_5A_5M.json"]);
    const db = await generateDatabase(
        samples.map((s) => s.input),
        { platform: "discord" },
        TestEnv
    );

    const str = compressDatabase(db);
    const final = decompressDatabase(str);

    expect(final).toEqual(db);
});
