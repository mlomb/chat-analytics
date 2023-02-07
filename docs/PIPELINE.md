# Pipeline

We call **the pipeline** all the steps that chat data goes through before reaching the report UI. This document tries to describe each step so you can get a general idea of how it works.

The following diagram gives an overview of the pipeline:

<img src="./media/pipeline.svg">

Quick jump to sections:

1. [Input files](#input-files)
2. [Parsing](#parsing)


## 1. Input files

The input files are chat exports, each platform has its own format. Usually they are provided by the user in the web app UI, using the CLI or calling the npm package.

For each file a `FileInput` interface has to be created, which along with metadata, contains the `slice(start?: number, end?: number): ArrayBuffer` function that must return a slice of the file in the specified range. This function is environment dependent. Since files may be large (several GBs) we don't read the whole file content into memory, instead we allow parsers to stream them. 

## 2. Parsing

[write]

If you want to support a new platform, you can find some guidance in [PARSER.md](./PARSER.md) document.
