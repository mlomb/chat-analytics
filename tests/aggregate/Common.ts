import { generateDatabase } from "@pipeline/index";

import { TestEnv, loadSamples } from "@tests/samples";

export const loadTestDatabase = async () => {
    const samples = await loadSamples(["telegram/BIG_20A_5475M.json"]);
    return await generateDatabase(
        samples.map((s) => s.input),
        { platform: "telegram" },
        TestEnv
    );
};
