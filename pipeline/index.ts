import { Env } from "@pipeline/Env";
import { ReportConfig } from "@pipeline/Types";
import { FileInput } from "@pipeline/parse/File";

import { createParser } from "./parse";
import { Processor } from "./process/Processor";

export const generateDatabase = async (files: FileInput[], config: ReportConfig, env: Env): Promise<any> => {
    const parser = createParser(config.platform);

    const processor = new Processor(parser);

    for (const file of files) {
        for await (const _ of parser.parse(file)) processor.process();
        processor.process();
    }

    console.log(processor);
};
