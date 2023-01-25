# Pipeline

<img src="./media/pipeline.svg">

TODO: write info

## Writing a new parser

### Parser class

You should implement a class that extends `Parser` and implements `parse(file)`, which parses a file at a time. You can check existing implementations to guide you.  

Basic template:
```typescript
import { Parser } from "@pipeline/parse/Parser";
import { FileInput } from "@pipeline/File";

export class MyPlatformParser extends Parser {

    async *parse(file: FileInput) {
        // parse here
    }

}
```

#### JSON-based parser

If your platform exports chats in JSON format and expect multiple GBs, you should stream the JSON object.

```typescript
import { JSONStream } from "@pipeline/parse/JSONStream";
import { streamJSONFromFile } from "@pipeline/File";
```

And then in your `parse(file)` function you can stream keys in the root like the following:

```typescript
const stream = new JSONStream();

stream.onObject<MyObject>("info", this.parseInfo.bind(this));
stream.onArrayItem<MyMessageItem>("messages", this.parseMessage.bind(this));

yield* streamJSONFromFile(stream, file);
```


#### Text/binary parsers

You can get the raw file bytes using `.slice()`. Then you can use TextEncoder to decode the UTF-8 sequence.

```typescript
const fileBuffer: Uint8Array = await file.slice();
const fileContent: string = new TextDecoder("utf-8").decode(fileBuffer);
```

### Platform specific changes

You will have to register this new platform in multiple places, start adding the relevant platform name to the `type Platform` in [Types.ts](pipeline/Types.ts). After that, if you try to compile you will get lots of errors of missing keys, you should complete everything (correctly). And probably in some other places I don't remember right now. You'll figure it out.

