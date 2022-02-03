<div align="center">

![Logo-Dark](assets/docs/banner_dark.png#gh-dark-mode-only)
![Logo-Light](assets/docs/banner_light.png#gh-light-mode-only)
  
<h4>Generate in-depth chat analysis reports</h4>

[Open App](https://chatanalytics.app) • [View Demo](https://chatanalytics.app/demo)


</div>

---

A web app that takes chat exports from supported platforms and generates a single HTML file containing information, statistics and graphs about them.  
To generate reports you need a browser with [ES6 support](https://caniuse.com/es6).


## Chat platform support

You can generate reports from the following platforms:

| Platform | Formats supported                                                                | Text content | Edits & Replies   | Attachment Types                                                                      | Reactions         | Profile picture         | Mentions     |
| -------- | -------------------------------------------------------------------------------- | ------------ | ----------------- | ------------------------------------------------------------------------------------- | ----------------- | ----------------------- | ------------ |
| Discord  | `json` from [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) | ✅           | ✅                | ✅ ([no stickers](https://github.com/Tyrrrz/DiscordChatExporter/issues/638))          | ✅                | ✅ (until link expires) | ✅ (as text) |
| Telegram | `json` from [Telegram Desktop](https://desktop.telegram.org/)                    | ✅           | ✅                | ✅                                                                                    | ❌ (not provided) | ❌                      | ✅ (as text) |
| WhatsApp | `txt` or `zip` exported from a phone                                             | ✅           | ❌ (not provided) | ✅<strong>*</strong> (if exported from iOS)<br>🟦 (generic if exported from Android) | N/A               | ❌                      | ✅ (as text) |

<strong>*</strong>: not all languages are supported, check [WhatsApp.ts](pipeline/parse/parsers/WhatsApp.ts).

You can't combine exports from different platforms.  
The contribution of [new platform parsers](pipeline/parse/parsers/README.md) is always welcomed 🙂

## Privacy & Analytics

Since all chat data always stays in the browser, there is zero risk of someone reading your chats. Note tough, that **the report HTML file contains sensible information** (one may reconstruct message contents for every message), so share your reports with people you trust.

The site does not use cookies either and uses a self-hosted version of [Plausible](https://plausible.io). All events do not contain PII and information is segmented (i.e 1MB-10MB, etc). Since I want full transparency, you can check the [site analytics here](https://p.chatanalytics.app/chatanalytics.app).

## Docs & Development

You can read [DOCS.md](DOCS.md) for technical details.  
In [TODO.md](TODO.md) you can find ideas and pending stuff to be implemented.

## Acknowledgements

* [FastText](https://fasttext.cc/), a library by Facebook for efficient sentence classification. MIT licensed.
* [lid.176.ftz model](https://fasttext.cc/docs/en/language-identification.html), provided by FastText developers for language identification. Distributed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
* [multilang-sentiment](https://github.com/marcellobarile/multilang-sentiment), for the translated AFINN database. MIT licensed.
* Emoji sentiment data from the work of Kralj Novak, Petra; Smailović, Jasmina; Sluban, Borut and Mozetič, Igor, 2015, Emoji Sentiment Ranking 1.0, Slovenian language resource repository CLARIN.SI, http://hdl.handle.net/11356/1048. Licensed with [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
* [stopwords-iso](https://github.com/stopwords-iso/stopwords-iso) for a collection of stopwords in a variety of languages. MIT licensed.
* All the libraries and tools that made this project possible 😀

## License

TO-DO
