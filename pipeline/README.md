# Pipeline

## Outline

The process is divided in multiple steps:

1. [PARSE](#PARSE): parse platform-specific chat dumps and store them in a common format
1. [PREPROCESS](#PREPROCESS): process everything that can be done ahead of time (and not in the UI)
1. [BLOCKS](#BLOCKS): generate data blocks that will be consumed by the cards in the UI

Steps 1 and 2 happen when the data is uploaded.
Step 3 occur in the report page (already exported) when a card in the UI requires the final processing.

#### Why not generate data blocks during preprocessing?

The report UI allows the user to filter authors, channels and time periods, meaning some extra processing must be done.

---

## PARSE

something something

## PREPROCESS

something something

## BLOCKS

something something


