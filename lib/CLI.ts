#!/usr/bin/env node

import fs from "fs";
import glob from "glob";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { generateDatabase, generateReportSite } from "@lib/index";
import { loadFile } from "@lib/NodeEnv";

const argv = yargs(hideBin(process.argv))
    .scriptName("chat-analytics")
    .usage("Usage: $0 -p <platform> <input files>")
    .option("platform", {
        alias: "p",
        description: "The platform to generate for",
        choices: ["discord", "messenger", "telegram", "whatsapp"] as const,
        type: "string",
        demandOption: true,
    })
    .option("inputs", {
        alias: "i",
        description: "The input file(s) to use (glob)",
        type: "array",
        coerce: (arg) => `${arg}`,
        demandOption: true,
    })
    .option("output", {
        alias: "o",
        description: "The output HTML filename",
        type: "string",
        default: "report.html",
    })
    .epilogue(
        `For more information visit: https://github.com/mlomb/chat-analytics\nOr use the app online: https://chatanalytics.app`
    )
    .parseSync();

const files = glob.sync(argv.inputs, { nodir: true });

console.log("Target platform:", argv.platform);
console.log("Output file:", argv.output);
console.log("Input files:");
for (const file of files) {
    console.log(` [*] ${file}`);
}

// run
const config = {
    platform: argv.platform,
};

(async () => {
    console.log("Generating report...");

    const db = await generateDatabase(files.map(loadFile), config);
    const result = await generateReportSite(db);

    fs.writeFileSync(argv.output, result.html, "utf8");

    console.log("Done!");
    console.log("The report contains:");
    console.log(` [*] ${db.channels.reduce((c, ch) => c + (ch.msgCount || 0), 0)} messages`);
    console.log(` [*] ${db.authors.length} authors`);
    console.log(` [*] ${db.channels.length} channels`);
    console.log(` [*] ${db.guilds.length} guilds`);
})();
