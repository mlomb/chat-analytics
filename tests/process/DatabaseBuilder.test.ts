import { Platform } from "@pipeline/Platforms";

import { checkDatabaseIsGeneratedCorrectly } from "@tests/process/Process";

describe("should generate correctly", () => {
    // prettier-ignore
    const cases: { platform: Platform; inputs: string[] }[] = [
        { platform: "discord", inputs: ["discord/SV_5A_5M.json"] },
        { platform: "discord", inputs: ["discord/GC_3A_5M.json"] },
        { platform: "discord", inputs: ["discord/SV_5A_5M.json", "discord/GC_3A_5M.json"] },
        { platform: "discord", inputs: ["discord/GC_3A_5M.json", "discord/SV_5A_5M.json"] }, // order should not matter

        // TODO: there is a lot more to test...
    ];

    test.each(cases)("$platform: $inputs", ({ platform, inputs }) =>
        checkDatabaseIsGeneratedCorrectly(platform, inputs)
    );
});
