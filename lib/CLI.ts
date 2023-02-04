#!/usr/bin/env node
import glob from "fast-glob";
import fs from "fs";
import prettyBytes from "pretty-bytes";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { loadFile, loadNodeAsset } from "@lib/NodeEnv";
import { generateDatabase, generateReport } from "@lib/index";
import { Progress } from "@pipeline/Progress";
import { Config } from "@pipeline/Types";

const argv = yargs(hideBin(process.argv))
    .scriptName("chat-analytics")
    .usage("Usage: $0 -p <platform> -i <input files>")
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

const files = glob.sync(
    argv.inputs.map((i) => i + ""),
    { onlyFiles: true }
);

console.log("Target platform:", argv.platform);
console.log("Demo: " + argv.demo);
console.log("Output file:", argv.output);
console.log("Input files:");
for (const file of files) {
    console.log(` [*] ${file}`);
}

// run
const config: Config = {
    platform: argv.platform,
    demo: argv.demo,
};
const NodeEnv = {
    loadAsset: loadNodeAsset,
    progress: new Progress(),
};
// } satisfies Env;

let lastTaskDisplayed = 0;

NodeEnv.progress.on("progress", (tasks, stats) => {
    const idx = tasks.length - 1;
    const { title, subject, progress } = tasks[idx];

    let line = title + (subject ? `: ${subject}` : "");
    if (progress) {
        const format = progress.format === "bytes" ? prettyBytes : (n: number) => n.toLocaleString();
        line += " ";
        line += format(progress.actual);
        if (progress.total) line += `/${format(progress.total)}`;
    }

    if (process.stdout.isTTY) {
        if (lastTaskDisplayed < idx) {
            lastTaskDisplayed = idx;
            process.stdout.write("\n");
        }

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(line);
    } else {
        if (lastTaskDisplayed < idx) {
            lastTaskDisplayed = idx;
            console.log(line);
        }
    }
});

(async () => {
    console.log("Generating report...");

    console.time("Done");
    const db = await generateDatabase(files.map(loadFile), config, NodeEnv);
    const result = await generateReport(db, NodeEnv);
    if (process.stdout.isTTY) process.stdout.write("\n");
    console.timeEnd("Done");

    fs.writeFileSync(argv.output, result.html, "utf8");

    console.log("Report data size: " + prettyBytes(result.data.length));
    console.log("Report HTML size: " + prettyBytes(result.html.length));
    console.log("The report contains:");
    console.log(` [*] ${db.numMessages} messages`);
    console.log(` [*] ${db.authors.length} authors`);
    console.log(` [*] ${db.channels.length} channels`);
    console.log(` [*] ${db.guilds.length} guilds`);
})();
