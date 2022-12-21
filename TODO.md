# TO-DO

Things pending or ideas. Don't expect them soon.

### Misc

* If someone is interested, maybe make a NodeJS package to be used as a library

### Report generation

* Handle english contractions (i.e combine "dont" and "don't")
* Improve compression or give an option to disable it, since it crashes the browser when exports are too big
* Currently, the timezone is picked from the machine that generates the report, it should be an option.
* Add configuration to reports:
   - Timezone
   - Whether to filter Stopwords
   - Whether to filter long words (currently filtering 1&lt;len&le;30)
* Detect misspelling of words (very hard)
* fastText is using like 80% of the generation time, can it be optimized, replaced with something better?
* If a channel is uploaded in several files, replies and other stuff breaks between them
* Weeks are off, currently being calculated as `floor((dayOfMonth - 1) / 7)` which is wrong.
* Detect if some ES6 or other API used during generation is not available and show an error early.
* Add other platform parsers like Google Teams, MS Teams, Slack, etc.

### Report UI

* Debounce aggregation (especially when changing the time)
* Avoid zooming charts out of view (performance)
* Make cool animations with AnimatedBars, like messages sent over time ([like this](https://www.reddit.com/r/dataisbeautiful/comments/cxuah9/usage_share_of_internet_browsers_1996_2019_oc/), very hard to do with the current setup. Should move everything to a canvas)
* Being able to export graphs as images
* New cards:
  * Messages most replied
  * Longest reply chain (don't know how to do it efficiently)
  * Lexical diversity
  * Response time of authors
  * Edit message avg time and how many messages (in %) an author edits
  * Most linker author
  * Sentiment per user?
  * bigrams, trigrams, n-grams?
* Data points at the end of the data should be marked as incomplete (with a distinct color, maybe dashed)
* Maybe replace the reactions (which can be a lot) with a "XX reactions" and hover/click to see them all.
* Being able to click words (and emojis?) and show who said it the most, in what channels and maybe some messages containing the word (maybe also with emojis, mentions, etc)
* Make the filter menu fixed and being able to show and collapse it
