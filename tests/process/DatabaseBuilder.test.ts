import { Platform } from "@pipeline/Platforms";

import { checkDatabaseIsGeneratedCorrectly } from "@tests/process/Process";

describe("should generate correctly", () => {
    // prettier-ignore
    const cases: { platform: Platform; inputs: string[] }[] = [
        { platform: "discord", inputs: ["discord/SV_5A_5M.json"] },
    ];

    test.each(cases)("$platform: $inputs", ({ platform, inputs }) =>
        checkDatabaseIsGeneratedCorrectly(platform, inputs)
    );
});
