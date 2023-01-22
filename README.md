<!--suppress HtmlDeprecatedAttribute -->
<div align="center">

![Logo-Dark](assets/images/logos/app_dark.svg#gh-dark-mode-only)
![Logo-Light](assets/images/logos/app_light.svg#gh-light-mode-only)

<h3>Generate insightful chat analysis reports</h3>

[Open App](https://chatanalytics.app) • [View Demo](https://chatanalytics.app/demo) • [Use CLI](#cli)

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/mlomb/chat-analytics/cicd.yml)
[![codecov](https://codecov.io/gh/mlomb/chat-analytics/branch/main/graph/badge.svg)](https://codecov.io/gh/mlomb/chat-analytics)
[![npm](https://img.shields.io/npm/v/chat-analytics)](https://www.npmjs.com/package/chat-analytics)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=NKHZJPKFJ34WJ)

</div>

---

A web app that takes chat exports from supported platforms and generates a single HTML file containing information, statistics and graphs about them.  
To generate reports you need a browser with [ES6 support](https://caniuse.com/es6).


## Chat platform support

You can generate reports from the following platforms:

| Platform  | Formats supported                                                                | Text content | Edits & Replies  | Attachment Types                                                                    | Reactions        | Profile picture        | Mentions    |
|-----------|----------------------------------------------------------------------------------|--------------|------------------|-------------------------------------------------------------------------------------|------------------|------------------------|-------------|
| Discord   | `json` from [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) | ✅            | ✅                | ✅                                                                                   | ✅                | ✅ (until link expires) | ✅ (as text) |
| Messenger | `json` from [Facebook DYI export](https://www.facebook.com/dyi)                  | ✅            | ❌                | ✅                                                                                   | ❌                | ❌                      | ✅ (as text) |
| Telegram  | `json` from [Telegram Desktop](https://desktop.telegram.org/)                    | ✅            | ✅                | ✅                                                                                   | ❌ (not provided) | ❌                      | ✅ (as text) |
| WhatsApp  | `txt` or `zip` exported from a phone                                             | ✅            | ❌ (not provided) | ✅<strong>*</strong> (if exported from iOS)<br>🟦 (generic if exported from Android) | ❌ (not provided) | ❌                      | ✅ (as text) |

<strong>*</strong>: not all languages are supported, check [WhatsApp.ts](pipeline/parse/parsers/WhatsApp.ts).

You can't combine exports from different platforms.  
The contribution of [new platform parsers](DOCS.md#writing-a-new-parser) is always welcomed 🙂

## Privacy & Analytics

Since all chat data always stays in the browser, there is zero risk of someone reading your chats. Note that **the report HTML file contains sensitive information** (one may reconstruct message contents for every message), so share your reports with people you trust.

The site does not use cookies either and uses a self-hosted version of [Plausible](https://plausible.io). All events do not contain PII and information is segmented (i.e 1MB-10MB, etc). Since I want full transparency, you can check the [site analytics here](https://p.chatanalytics.app/chatanalytics.app).

## CLI

You can generate reports from the command line using `npx chat-analytics`:

```
Usage: chat-analytics -p <platform> -i <input files>

Options:
      --help      Show help                                            [boolean]
      --version   Show version number                                  [boolean]
  -p, --platform  The platform to generate for
   [string] [required] [choices: "discord", "messenger", "telegram", "whatsapp"]
  -i, --inputs    The input file(s) to use (glob)             [array] [required]
  -o, --output    The output HTML filename     [string] [default: "report.html"]
      --demo      Mark the report as a demo           [boolean] [default: false]
```

For example:

```sh
npx chat-analytics -p discord -i "exported/*.json" -o report.html
```

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

MIT. See [LICENSE](LICENSE).
