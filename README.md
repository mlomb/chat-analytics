# PROJECT NAME

## Web App

To generate reports using the web app, you need a browser with [ES6 support](https://caniuse.com/es6).


## Chat platform support

| Platform | Formats supported                                                                | Text content | Edits & Replies   | Attachment Types                                                                      | Reactions         | Profile picture         | Mentions     |
| -------- | -------------------------------------------------------------------------------- | ------------ | ----------------- | ------------------------------------------------------------------------------------- | ----------------- | ----------------------- | ------------ |
| Discord  | `json` from [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) | ✅           | ✅                | ✅ ([no stickers](https://github.com/Tyrrrz/DiscordChatExporter/issues/638))          | ✅                | ✅ (until link expires) | ✅ (as text) |
| Telegram | `json` from [Telegram Desktop](https://desktop.telegram.org/)                    | ✅           | ✅                | ✅                                                                                    | ❌ (not provided) | ❌                      | ✅ (as text) |
| WhatsApp | `txt` or `zip` exported from a phone                                             | ✅           | ❌ (not provided) | ✅<strong>*</strong> (if exported from iOS)<br>🟦 (generic if exported from Android) | N/A               | ❌                      | ✅ (as text) |

<strong>*</strong>: not all languages are supported, check [WhatsApp.ts](pipeline/parse/parsers/WhatsApp.ts).

You can't combine exports from different platforms.  
The contribution of new platform parsers is always welcomed 🙂

## Analysis support




## Building and Testing

The following npm scripts are available:

* `build`: build `app/` and `report/` using webpack and writes it to `dist/`
* `dev`: open a development server of `app/` and `report/` using webpack-serve
* `test`: run pipeline tests in `tests/`

## TO-DO

add this links

[Write a new parser](pipeline/parse/parsers/README.md)

## License

TO-DO
