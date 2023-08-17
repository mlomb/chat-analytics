# v1.1.1 (YYYY/MM/DD) [IN DEVELOPMENT]


# v1.1.0 (2023/08/17)

- Bugfix: DM/Group channel labels (Alice & Bob) were showing an invalid picture.
- Added calls support for Discord and Telegram: [#76](https://github.com/mlomb/chat-analytics/issues/76) [#88](https://github.com/mlomb/chat-analytics/pull/88)
    - Time spent on calls over time
    - Number of calls initiated over time
    - Total calls, total time spent on calls, average/median call duration
    - Call duration distribution
    - Average/median time between calls
    - Time spent on calls by week day / hour
    - Most calls initiated

<img src="https://github.com/mlomb/chat-analytics/assets/5845105/bbf21f1c-4202-4c9a-ab9d-ff3b3c6c199b" width="300" title="New calls section" />

# v1.0.3 (2023/07/10)

- Telegram now supports both `date` and `date_unixtime` in exports. [#80](https://github.com/mlomb/chat-analytics/issues/80)
- Telegram exports now do not break when there are DST changes in the middle of a file. [#79](https://github.com/mlomb/chat-analytics/issues/79) [#80](https://github.com/mlomb/chat-analytics/issues/80)
- Activity by hour/weekday Y-axis now starts at 0. [(4cb8ae4)](https://github.com/mlomb/chat-analytics/commit/4cb8ae4904901e4238c5b5f59e02c6c5040d1d03)

# v1.0.2 (2023/06/29)

- Bugfix in big exports: when the message buffer reaches 2^32 bits serialization breaks because bitwise operations are done in 32 bits. Now we use BigInts where necessary and avoid some bitwise operations. [#83](https://github.com/mlomb/chat-analytics/issues/83)

# v1.0.1 (2023/04/03)

- Bugfix Discord: regular emoji were not being rendered correctly in MessageLabel because the ID was being set (due to DCE now including an empty ID) [(87ab3f8)](https://github.com/mlomb/chat-analytics/commit/87ab3f8df20ea493056f0832d50b1b8661e67fa3)
- Bugfix in URL parsing: some GET parameters were not being matched. Now using the same regex used by Discord. Added tests. [#72](https://github.com/mlomb/chat-analytics/pull/72)
- Added platform clarification about CLI in DCE [(de8c517)](https://github.com/mlomb/chat-analytics/commit/de8c5177fdc1194497a3bdbafd5e476d7f97837e)

# v1.0.0 (2023/03/02)

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
