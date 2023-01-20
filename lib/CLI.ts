#!/usr/bin/env node

import fs from "fs";
import glob from "glob";
import prettyBytes from "pretty-bytes";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { generateDatabase, generateReportSite } from "@lib/index";
import { loadFile } from "@lib/NodeEnv";
import { ReportConfig } from "@pipeline/Types";

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
        demandOption: true,
    })
    .option("output", {
        alias: "o",
        description: "The output HTML filename",
        type: "string",
        default: "report.html",
    })
    .option("demo", {
        description: "Mark the report as a demo",
        type: "boolean",
        default: false,
    })
    .epilogue(
        `For more information visit: https://github.com/mlomb/chat-analytics\nOr use the app online: https://chatanalytics.app`
    )
    .parseSync();

let files = argv.inputs.map((i) => glob.sync(`${i}`, { nodir: true })).flat();
files = [...new Set(files)];

console.log("Target platform:", argv.platform);
console.log("Demo: " + argv.demo);
console.log("Output file:", argv.output);
console.log("Input files:");
for (const file of files) {
    console.log(` [*] ${file}`);
}

// run
const config: ReportConfig = {
    platform: argv.platform,
    demo: argv.demo,
};

(async () => {
    console.log("Generating report...");

    console.time("Done");
    const db = await generateDatabase(files.map(loadFile), config);
    const result = await generateReportSite(db);
    console.timeEnd("Done");

    fs.writeFileSync(argv.output, result.html, "utf8");

    console.log("Report data size: " + prettyBytes(result.data.length));
    console.log("Report HTML size: " + prettyBytes(result.html.length));
    console.log("The report contains:");
    console.log(` [*] ${db.channels.reduce((c, ch) => c + (ch.msgCount || 0), 0)} messages`);
    console.log(` [*] ${db.authors.length} authors`);
    console.log(` [*] ${db.channels.length} channels`);
    console.log(` [*] ${db.guilds.length} guilds`);
})();
