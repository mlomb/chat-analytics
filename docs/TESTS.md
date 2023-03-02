# Tests

[![codecov](https://codecov.io/gh/mlomb/chat-analytics/branch/main/graph/badge.svg)](https://codecov.io/gh/mlomb/chat-analytics)

## What we test?

We test the generation pipeline. We **do not** test the UI (React components), at least for now. Coverage is collected for the following folders:

* ✔️ `assets/Plausible.ts`
* ✔️ `lib/` excluding `CLI.ts`
* ✔️ `pipeline/`
* ❌ `app/` (UI)
* ❌ `report/` (UI)

We try to keep a good coverage, especially in the `pipeline` folder (>90/95%?). With an exception: `pipeline/aggregate/blocks`. We _should_ be testing it but it is a bit annoying and I don't have the time to do it, for now I'm resorting to compare reports generated with multiple samples (since it is easy to compare). But of course it is included in the coverage, so it hurts me :).

## How we test?

We test with the [jest](https://jestjs.io) library. All tests run in the node environment by default, though specific tests may override this and use the jsdom environment using `@jest-environment jsdom` at the top of the file.

You can run all tests with:

```sh
npm run test
```

For easier development, you can run the following command to run tests after file changes:

```sh
npm run test:watch
```

## Where to put tests?

The following is not a strict rule, but we try to keep the test files in a similar directory structure to the source files.
Tests should exclusively be inside the `tests/` folder.
