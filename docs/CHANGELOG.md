# v1.0.1 [IN DEVELOPMENT]

- Bugfix Discord: regular emoji were not being rendered correctly in MessageLabel because the ID was being set (due to DCE now including an empty ID)

# v1.0.0

After a lot of work in [#39](https://github.com/mlomb/chat-analytics/pull/39), [#53](https://github.com/mlomb/chat-analytics/pull/53), [#55](https://github.com/mlomb/chat-analytics/pull/55) and [#58](https://github.com/mlomb/chat-analytics/pull/58) (more than 200 commits of refactors and improvements) I can say I'm happy to call this the first release of Chat Analytics!

This is the first entry in the changelog, so I'll just list **some** changes that were introduced in the PRs:

## Pipeline

- Support for multiple guilds
- Mostly all the pipeline code has been rewritten with comments and better code overall
- TESTING: added a lot of tests for the pipeline (+200) with >90% coverage (if excluding aggregation)
- Now input files that have overlapped messages are merged (duplicate messages are ignored)
- Now we keep the latest information about authors and channels and guilds, like the name and avatar
- 4x speedup in base91 decoding
- I'm sure there is a lot more to put here but I can't remember

## App

- Changed branding a bit
- Now it displays the number of files being processed/to be processed
- It displays the number of guilds when done
- Moved platform instructions to its own file, and separated platform information from the app, so it can be used in the pipeline
- Generation errors are now reported to Plausible
- Now the resulting report HTML file includes the name of the guild/server/group/chat
- Fix a leak in PII when using Plausible

## Report

- The block request system have been completely replaced: Card now does not require a block key, data must be retrieved with `useBlockData`, to allow multiple blocks in a single card
- Improved chart performance:
  - Defer chart creation until the chart is visible
  - Disable chart ticks when not in view
  - Resizing debounced
  - Also removed a lot of boilerplate making a common wrapper, this allowed the optimizations above
- Created boxplot with histogram chart
- Now bot authors have an icon alongside their name
- All charts now have proper tooltips and hover information
- The timeline tab now shows the number of messages per guild or per group if appropiate
- Added a link to report issues in ErrorBoundary
- Most charts have been modified to look prettier (colors, margins, kind of series, etc)
- Words have its own stats now: usage over time, who write them the most, which channels they are used the most.
- Added a few statistics in Message statistics
- Renamed "combined" to "heatmap" in activity by hour/weekday
- Fixed the scale of the activity by hour/weekday heatmap, it was inverted
- Added a card: "Edited messages [by author/in channel]"
- Added a card: "Time between sending and editing"
- `AnimatedBars` now memoize the sort of the items array (used extensively)
- Now the "Messages sent over time" will default to by month if there is more than 2 years of data (instead of by day)
- Renamed "non-bot" to "human"
- Added a card: "Linked by domain hierarchy"
- Added a card: "Most links sent [by author/in channel]"
- A lot other performance and bug fixes

# Documentation

- Added documentation, there was practically none before
- Cool graphic depicting [the pipeline](https://github.com/mlomb/chat-analytics/blob/main/docs/PIPELINE.md)
