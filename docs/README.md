# Docs

We are building chat-analytics using [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), [amCharts 5](https://github.com/amcharts/amcharts5) and [webpack 5](https://webpack.js.org/).

# Architecture

The project is split into 3 main parts:

* `pipeline/`: the pipeline, which handles all the data from the input to the final aggregated data. **This is the core of the project** and it is described in detail in [PIPELINE.md](./PIPELINE.md).
* `app/`: the main UI for generating reports, which is hosted in [chatanalytics.app](https://chatanalytics.app). It uses a WebWorker to run the pipeline.
* `report/`: the report UI, which is exported as a single, static HTML file, acting like a placeholder. Then it is filled with the processed data from the pipeline to display the graphs and stats.

A small but relevant part is:

* `lib/`: contains the entry point for the [chat-analytics package](https://www.npmjs.com/package/chat-analytics), as well as the CLI.

## Developing

## About the demo

The [demo](https://chatanalytics.app/demo) is an export from the [DefleMask](https://www.deflemask.com) server which is from a friend of mine who gave me permission to use it as a demo. The input files are stored in a Google Drive zip and later downloaded [during CI](/.github/workflows/cicd.yml) to build the demo HTML automatically using the CLI (with `--demo`). It is updated manually by me using (we may want to move to a periodic workflow eventually):

```sh
docker run --rm -it -v $PWD/out:/out tyrrrz/discordchatexporter:stable exportguild -f json -g 253601524398293010 -t <token>
```

Zipping and then replacing the file in Google Drive (~280MB uncompressed, 23MB compressed).

---
