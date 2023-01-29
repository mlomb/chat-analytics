# Development

Hi there!

Don't forget to run `npm install` before starting to develop.

## Developing UI

Run `npm run dev`. You can now open:

* [http://localhost:8080](http://localhost:8080) to develop the `app/` UI
* [http://localhost:8080/report.html](http://localhost:8080/report.html) to develop the `report/` UI

> **Warning**:
> To develop the `report/` UI, you need to provide data to the report. You can generate the report data once, using the `app/` UI. You will see a green button that is not present in production called "Download DATA". You should place the downloaded file in `assets/public/` with the name `report_sample.data`.

## Developing the CLI

You have to link the package locally to be able to use it, after that you have to build the node version and invoke it:

```sh
npm link
npm run build:node && chat-analytics -p whatsapp -i "export/*"
```

## Testing

Head to [TESTS.md](./TESTS.md) for information about testing!

## Building

### Web build

To generate a production build for the web, you need to run:

```sh
npm run build:web
```

The output files will be in `dist_web/`.

> **Note**:
> Note that this build is missing the `demo.html` file. It has to be generated separately.

### Node build

To generate a production build for Node, you need to run:

```sh
npm run build:node
```

The output files will be in `dist/`.

> **Warning**:
> You must build the web version too, since the Node version requires the static `dist_web/report.html` to be able to generate reports.

## General things to know

* [Prettier](https://prettier.io) is used to format code. Don't forget to run `npm run format` before committing or enable the "Format on save" option in your editor, configured to use Prettier.
* JSX should only be used in `app/` and `report/`. In `pipeline/` it is not supported, since it has to be compatible with Node.
* Do not export the props interface if no one is importing it. If props are not being exported, you should call the props interface just `Props`.
* (TODO: add more)
