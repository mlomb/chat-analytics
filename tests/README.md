# Tests

[![codecov](https://codecov.io/gh/mlomb/chat-analytics/branch/main/graph/badge.svg)](https://codecov.io/gh/mlomb/chat-analytics)

## What we test?

We test the generation pipeline. We **do not** test the UI (React components), at least for now. Coverage is collected for the following folders:

* ✔️ `assets/Plausible.ts`
* ✔️ `lib/` excluding `CLI.ts`
* ✔️ `pipeline/`
* ❌ `app/` (UI)
* ❌ `report/` (UI)

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
