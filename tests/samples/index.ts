import path from "path";

import { loadFile, loadNodeAsset } from "@lib/NodeEnv";
import { FileInput } from "@lib/index";
import { Env } from "@pipeline/Env";

import { ExpectedPartialParseResult } from "@tests/parse/Parse";
import { ExpectedPartialDatabaseResult } from "@tests/process/Process";

export interface Sample {
    input: FileInput;

    expectedParse: ExpectedPartialParseResult;
    expectedDatabase: ExpectedPartialDatabaseResult;
}

/**
 * Load a test sample
 *
 * @param filepath it expects the path relative to `@tests/samples`, e.g. `discord/DM_2A_2M.json`
 */
export const loadSample = async (filepath: string) => {
    const samplePath = path.join(__dirname, filepath);
    const input = loadFile(samplePath);
    const module = await import(samplePath + ".ts");

    return {
        input,
        expectedParse: module.expectedParse,
        expectedDatabase: module.expectedDatabase,
    };
};

export const loadSamples = (filepaths: string[]) => Promise.all(filepaths.map((fp) => loadSample(fp)));

/** Common Env for running tests */
export const TestEnv: Env = { loadAsset: loadNodeAsset };
