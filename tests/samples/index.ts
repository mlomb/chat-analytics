import path from "path";

import { loadFile, loadNodeAsset } from "@lib/NodeEnv";
import { Env } from "@pipeline/Env";

/** @param sample it expects the path relative to `@tests/samples`, e.g. `discord/DM_2A_2M.json` */
export const getSamplePath = (sample: string) => path.join(__dirname, sample);

/** Load a test sample */
export const loadSample = (filepath: string) => loadFile(getSamplePath(filepath));

/** Common Env for running tests */
export const TestEnv: Env = { loadAsset: loadNodeAsset };
