# todo.md

## Tasks

- [x] Clone upstream repository into `T:\Code\chat-analytics`.
  - Status: completed. Repository cloned from `https://github.com/mlomb/chat-analytics`.
- [x] Inspect project structure and Telegram sample export.
  - Status: completed. Main Telegram input is `result.json`; sample export has 23,333 messages.
- [x] Prepare local input/output infrastructure.
  - Status: completed. Added ignored `IN/` and `OUT/` folders with README guidance.
- [x] Copy provided Telegram sample into local ignored input folder.
  - Status: completed. Copied to `IN\telegram_export_2026-04-18`.
- [x] Verify install/build path for Telegram report generation.
  - Status: completed. `npm ci`, parser regression test, node/web builds, and Telegram CLI report generation succeeded; report written to `OUT\report.html`.
- [x] Analyze repository architecture and modernization opportunities.
  - Status: completed. Delegated architecture, product/localization, report-artifact, and maintenance reviews; consolidated findings into roadmap.
- [x] Analyze generated Telegram report for Russian-language product fit.
  - Status: completed. Evaluated verified `OUT\report.html` output and Russian Telegram gaps without exposing private chat text.
- [x] Save detailed analysis report in project documentation.
  - Status: completed. Saved consolidated Russian report to `docs\REPOSITORY_ANALYSIS_RU.md`.
- [x] Implement minimal P0 maintenance guardrails.
  - Status: completed. Added Node 20 engine guardrail, typecheck script, and updated CI/publish Node versions to 20.x.
- [x] Implement minimal Telegram reactions support.
  - Status: completed. Telegram parser now emits existing `PMessage.reactions`; parser regression test covers emoji/text reaction shapes.
- [x] Update documentation for implemented P0 changes.
  - Status: completed. README, DEV guide, and repository analysis now reflect Node 20/typecheck and minimal Telegram reactions support.
- [x] Verify full selected P0 slice.
  - Status: completed. `typecheck`, parser tests, node/web builds, and Telegram report generation passed; web build keeps existing asset-size warnings.
- [x] Create compact repository AGENTS.md.
  - Status: completed. Added root `AGENTS.md` with verified commands, architecture map, data/privacy rules, and repository workflow guardrails.
- [x] Run final integrated verification for prepared work.
  - Status: completed. Typecheck, parser tests, format-check, node/web builds, and Telegram report generation passed; web build has existing asset-size warnings.
- [x] Review prepared change set for privacy and scope.
  - Status: completed. Scope/privacy reviews found no secrets; private `IN` export and generated `OUT/report.html` must remain uncommitted.
- [x] Create local Git checkpoint commit for prepared work.
  - Status: completed. Created task branch and prepared a local checkpoint commit with only safe source/docs/readme files staged; private/generated data stayed uncommitted.
- [ ] Push checkpoint branch and create pull request.
  - Status: in_progress. Preparing remote branch and PR from verified local checkpoint.
