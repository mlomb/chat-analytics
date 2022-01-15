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

---

### Acknowledgements

* [FastText](https://fasttext.cc/), a library by Facebook for efficient sentence classification. MIT licensed.
* [lid.176.ftz model](https://fasttext.cc/docs/en/language-identification.html), provided by FastText developers for language identification. Distributed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
* [multilang-sentiment](https://github.com/marcellobarile/multilang-sentiment), for the translated AFINN database. MIT licensed.
* [emoji-sentiment](https://github.com/dematerializer/emoji-sentiment) for the emoji sentiment data as JSON. Original dataset from the work of Kralj Novak, Petra; Smailović, Jasmina; Sluban, Borut and Mozetič, Igor, 2015, Emoji Sentiment Ranking 1.0, Slovenian language resource repository CLARIN.SI, http://hdl.handle.net/11356/1048. JSON licensed as MIT, original dataset with [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
* [stopwords-iso](https://github.com/stopwords-iso/stopwords-iso) for a collection of stopwords in a variety of languages. MIT licensed.
* All the libraries and tools that made this project possible 😀

## License

TO-DO
