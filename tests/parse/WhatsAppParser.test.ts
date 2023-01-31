import { WhatsAppParser } from "@pipeline/parse/parsers/WhatsAppParser";

import { checkSamplesAreParsedCorrectly, runParserFromSamples } from "./Util";

describe("should resolve correctly", () => {
    // prettier-ignore
    const cases = [
        [["1A_3M.txt"]],
        [["4A_11M.txt"]],
        [["4A_11M.zip"]],
    ];

    test.each(cases)(
        "%s",
        async (filenames) =>
            await checkSamplesAreParsedCorrectly(
                WhatsAppParser,
                filenames.map((filename) => `whatsapp/${filename}`)
            )
    );
});
