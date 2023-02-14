import { generateDatabase } from "@pipeline/index";

import { TestEnv, loadSamples } from "@tests/samples";

export const loadTestDatabase = async () => {
    const samples = await loadSamples(["discord/GC_3A_5M.json", "discord/SV_5A_5M.json"]);
    const db = await generateDatabase(
        samples.map((s) => s.input),
        { platform: "discord" },
        TestEnv
    );
    return db;
};
