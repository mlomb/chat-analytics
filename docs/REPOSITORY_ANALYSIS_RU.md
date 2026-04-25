# Аналитический отчет по репозиторию chat-analytics

Дата анализа: 2026-04-24
Проект: `mlomb/chat-analytics`
Локальная рабочая копия: `T:\Code\chat-analytics`

## Executive summary

`chat-analytics` — зрелый и инженерно сильный проект для локальной генерации интерактивных HTML-отчетов по экспортам чатов. Его главная ценность — privacy-first модель: данные пользователя обрабатываются локально и упаковываются в самодостаточный отчет.

При этом проект выглядит давно не развивавшимся: часть стека сборки и зависимостей все еще ориентирована на эпоху npm lockfile v2 / TypeScript 4.9 / Jest 28. Локально уже добавлены минимальные guardrails для Node 20 и typecheck, но архитектура ядра обработки остается перегруженной: `DatabaseBuilder` и `MessageProcessor` стали ключевыми точками связности и риска.

На локальном Telegram-экспорте отчет успешно генерируется и уже полезен как базовый обзор активности. Однако для русскоязычной Telegram-аналитики продукту не хватает трех направлений зрелости:

1. **Telegram-native semantic layer** — реакции, пересылки, темы/треды, опросы, service events, медиа и richer reply graph.
2. **Русскоязычный NLP layer** — лемматизация, русские stopwords, нормализация `ё/е`, устойчивый поиск и sentiment под RU-чаты.
3. **Product interpretation layer** — не только графики активности, но и выводы о качестве диалога, вовлеченности, темах, шуме и ролях участников.

Рекомендуемый вектор: сначала стабилизировать runtime/tooling и Telegram parser boundary, затем добавить RU NLP baseline и Telegram-specific analytics, после чего развивать продуктовые метрики и UX.

---

## Проверенные факты и локальный статус

### Репозиторий и сборка

- Проект клонирован из `https://github.com/mlomb/chat-analytics`.
- Это TypeScript/npm-проект с `package.json`, `package-lock.json`, `webpack.config.js`, `tsconfig*.json`.
- Основные команды:
  - `npm ci`
  - `npm run build:node`
  - `npm run build:web`
  - `npm test`
- Локально добавлены приватные рабочие папки:
  - `IN/` — входные экспорты чатов;
  - `OUT/` — сгенерированные отчеты.
- `IN/` и `OUT/` игнорируются git, кроме README-файлов.

### Локальная проверка на Telegram export

Источник: `IN/telegram_export_2026-04-18/result.json`
Сгенерированный отчет: `OUT/report.html`

Проверенные результаты CLI:

- отчет создан в `OUT/report.html`;
- report data size: около `707 kB`;
- report HTML size: около `1.89 MB`;
- отчет содержит:
  - `23,057` сообщений;
  - `2` автора;
  - `1` канал;
  - `1` guild.

Исходный Telegram export содержал `23,333` записей/сообщений верхнего уровня. Разница объясняется тем, что не все Telegram entries являются пользовательскими сообщениями, пригодными для текущей модели отчета: часть service events и специфичных Telegram-сущностей сейчас не попадает в полноценные аналитические измерения.

### Локальные исправления в рабочей копии

В текущей локальной ветке уже внесены подготовительные изменения:

- добавлены `IN/README.md`, `OUT/README.md`;
- обновлены `README.md` и `.gitignore` для локального privacy-safe workflow;
- выровнены dev-зависимости Jest 28.x, чтобы устранить конфликт `@types/jest` / `expect` / `jest-matcher-utils`;
- исправлен Telegram parser для nested text entities и poll question entities;
- добавлены regression tests в `tests/parse/Parsers.test.ts`;
- подтверждено:
  - `npm ci` проходит;
  - `npm run build:node` проходит;
  - `npm run build:web` проходит;
  - `npx jest tests/parse/Parsers.test.ts --runInBand --verbose` дает `21/21` passing tests;
  - CLI report generation проходит на локальном Telegram export.

---

## Карта архитектуры

### 1. Parse layer

Пути:

- `pipeline/parse/index.ts`
- `pipeline/parse/Parser.ts`
- `pipeline/parse/File.ts`
- `pipeline/parse/Types.ts`
- `pipeline/parse/parsers/*`

Назначение:

- принимает platform-specific exports;
- преобразует их в общий поток событий;
- нормализует сущности в `PGuild`, `PChannel`, `PAuthor`, `PMessage`, `PCall`.

Поддерживаемые парсеры:

- `DiscordParser.ts`
- `MessengerParser.ts`
- `TelegramParser.ts`
- `WhatsAppParser.ts`

Сильная сторона слоя — наличие общего parser contract и streaming-подхода через `FileInput` / `slice()`, что важно для больших экспортов.

### 2. Process layer

Пути:

- `pipeline/process/DatabaseBuilder.ts`
- `pipeline/process/ChannelMessages.ts`
- `pipeline/process/MessageProcessor.ts`
- `pipeline/process/Types.ts`
- `pipeline/process/nlp/*`

Назначение:

- принимает события парсеров;
- группирует сообщения;
- запускает NLP/tokenization/language/sentiment;
- строит внутреннюю `Database` модель;
- подготавливает данные для сериализации и отчета.

Главный риск: `DatabaseBuilder` стал центральным stateful-объектом, а `MessageProcessor` напрямую связан с его внутренними структурами.

### 3. Serialization / compression layer

Пути:

- `pipeline/serialization/*`
- `pipeline/compression/*`

Назначение:

- компактное хранение сообщений;
- custom binary representation;
- compression + encoding для упаковки в HTML report.

Это одна из сильнейших частей проекта: отчет получается существенно меньше исходного Telegram JSON.

### 4. Aggregate layer

Пути:

- `pipeline/aggregate/Blocks.ts`
- `pipeline/aggregate/Common.ts`
- `pipeline/aggregate/Filters.ts`
- `pipeline/aggregate/blocks/*`

Назначение:

- вычисляет аналитические блоки для UI;
- работает поверх уже подготовленной базы;
- используется report worker’ом лениво, по запросу.

Риск: часть aggregate blocks тестируется слабее, чем core serialization/process utilities.

### 5. Report UI

Пути:

- `report/index.tsx`
- `report/ReportPage.tsx`
- `report/WorkerWrapper.ts`
- `report/WorkerReport.ts`
- `report/BlockStore.ts`
- `report/components/*`

Назначение:

- отображает интерактивный отчет;
- распаковывает embedded data;
- считает тяжелые блоки в WebWorker;
- предоставляет фильтры, вкладки и визуализации.

Риск: singleton state в `BlockStore` / `WorkerWrapper` упрощает runtime wiring, но усложняет тестирование и изоляцию.

### 6. App builder UI

Пути:

- `app/index.tsx`
- `app/WorkerApp.ts`
- `app/WebEnv.ts`
- `app/components/*`

Назначение:

- browser UI для загрузки экспортов;
- генерация self-contained report в браузере;
- orchestration пользовательского сценария создания отчета.

---

## Сильные стороны

### Privacy-first архитектура

Проект делает сильную продуктовую ставку: чаты не уходят на сервер. Это особенно ценно для личных и корпоративных Telegram/WhatsApp/Discord экспортов.

### Хорошее разделение pipeline-слоев

Структура `parse → process → serialization/compression → aggregate → report` понятна и расширяема. Новому разработчику можно объяснить поток данных без чтения всего кода.

### Streaming input model

`FileInput` и chunk-based parsing важны для больших экспортов. Это правильная база для обработки десятков и сотен тысяч сообщений.

### Типизированные доменные контракты

`pipeline/parse/Types.ts` и `pipeline/process/Types.ts` фиксируют общий формат данных. Это снижает хаос между platform parsers и downstream analytics.

### Компактная сериализация

Custom serialization в `pipeline/serialization/*` и compression в `pipeline/compression/*` позволяют получить небольшой self-contained report даже из крупного JSON export.

### WebWorker для тяжелых операций

`report/WorkerReport.ts` и `report/WorkerWrapper.ts` выносят тяжелые вычисления из main thread, что важно для интерактивности отчета.

### Документация уже есть

Полезные документы:

- `docs/PIPELINE.md`
- `docs/PARSER.md`
- `docs/DEV.md`
- `docs/TESTS.md`
- `README.md`

---

## Основные риски и ограничения

### 1. `DatabaseBuilder` как god object

`pipeline/process/DatabaseBuilder.ts` совмещает много ролей:

- event routing от парсера;
- накопление authors/channels/messages;
- управление pending messages;
- запуск NLP processing;
- reindexing;
- final object construction;
- статистику и служебное состояние.

Это повышает риск регрессий при добавлении Telegram-specific semantics и RU NLP.

### 2. Сильная связность `MessageProcessor` с `DatabaseBuilder`

`pipeline/process/MessageProcessor.ts` прямо завязан на builder state. Это усложняет:

- unit-тестирование обработки сообщений;
- замену NLP pipeline;
- добавление language-specific processors;
- оптимизацию hot paths.

Рекомендуемое направление: ввести более узкий processing context / collector interface вместо прямого доступа к builder.

### 3. Недостаточное покрытие UI и aggregate layer

Тестовая база сильнее покрывает serialization/process helpers, чем UI/report/aggregate blocks. Для продукта, где ценность находится в отчете, это риск.

Нужно добавить smoke/integration tests для:

- report loading;
- worker initialization;
- critical aggregate blocks;
- Telegram-specific cards.

### 4. Устаревший tooling

Наблюдения:

- CI переведен на Node 20.x в локальной рабочей копии;
- `package-lock.json` lockfileVersion 2;
- TypeScript 4.9;
- Jest/ts-jest 28;
- webpack-dev-server 4;
- Prettier 2;
- добавлен `engines.node` для Node 20;
- `packageManager` пока не зафиксирован, чтобы не добавлять Corepack/toolchain coupling;
- добавлен явный `typecheck`, но `lint` / `test:ci` еще не выделены.

Это делает проект чувствительным к современной Node/npm среде.

### 5. Supply-chain риск в CI

В workflow используется внешний Google Drive ZIP для demo generation. Это слабое место:

- источник не является воспроизводимым артефактом;
- сложно валидировать checksum;
- есть риск внешнего изменения данных.

### 6. Telegram support неполный для современного Telegram

Текущий Telegram parser уже полезен, но не покрывает Telegram как полноценную аналитическую платформу:

- reactions теперь извлекаются минимально через существующий `PMessage.reactions` pipeline;
- rich service events;
- forwards;
- topics/threads;
- polls как отдельные сущности;
- group calls;
- pins;
- media semantics.

---

## Анализ текущего Telegram/RU отчета

Судя по сгенерированному `OUT/report.html`, базовый отчет уже полезен как обзорный дашборд, но для Telegram/RU-кейса он пока остается скорее универсальным, чем действительно продуктовым.

### Что уже есть в текущем отчете

- сводка по сообщениям, авторам, каналу и языку;
- временная линия активности;
- базовые метрики по редактированиям и ответам;
- интерактивная загрузка данных в браузере через WebWorker;
- компактная самодостаточная HTML-упаковка с встроенным сжатым датасетом.

### Ограничения именно для Telegram

- **Telegram reactions извлекаются минимально**, но отдельные Telegram-native reaction dashboards еще не добавлены;
- **service events** обрабатываются только частично;
- не раскрыта семантика **forwarded messages**, **topics/threads**, **pins**, **polls** как аналитических сущностей;
- отсутствует отдельная аналитика по **group_call / group_call_scheduled** и другим rich service actions;
- **timezone** остается TODO, из-за чего метрики активности могут смещаться относительно локального времени пользователей;
- RU-текст проходит через нормализацию и токенизацию, но без лемматизации;
- короткие русские сообщения и смешанный чатовый сленг могут ухудшать language detection и sentiment.

### Практический вывод

Текущий отчет технически корректен и пригоден как минимальный продукт, но для русскоязычной Telegram-аналитики ему не хватает:

1. **семантического слоя Telegram**;
2. **русскоязычного NLP-слоя**;
3. **продуктового слоя интерпретации метрик**.

---

## Возможности продукта для русскоязычной Telegram-аналитики

### 1. Русскоязычная лингвистическая база

- лемматизация/стемминг для русского языка;
- нормализация `ё → е` на уровне поиска и аналитики;
- русские stopwords и чатовые stopwords;
- поддержка смешанного RU/EN текста;
- устойчивое определение языка на коротких сообщениях;
- отдельная обработка emoji, сокращений, матов, интернет-сленга и транслита.

### 2. Telegram-specific analytics

- реакции и emoji-reactions как отдельная сущность: базовое извлечение уже добавлено, следующий шаг — отдельные карточки и интерпретация;
- forwards: источник, глубина распространения, virality path;
- replies graph: кто кому отвечает, плотность диалогов, центральность участников;
- topics/threads: разбиение обсуждений по веткам;
- pins: что закрепляют и как это влияет на активность;
- polls: вопрос, ответы, вовлеченность, динамика по времени;
- service events: join/leave, calls, scheduled calls, group creation, title changes;
- media analytics: фото, видео, voice, stickers, files;
- anti-noise layer: service chatter, bot spam, массовые пересылки, автоуведомления.

### 3. Продуктовая интерпретация диалогов

- качество диалога по участникам и каналам;
- баланс `broadcast vs conversation`;
- доля meaningful messages vs noise;
- индекс вовлеченности;
- доля быстрых ответов;
- cross-user interaction density;
- темп обсуждения по часовым поясам и рабочим окнам;
- темы с высокой эмоциональной нагрузкой.

### 4. Поиск и навигация

- кириллический поиск по леммам;
- поиск по нормализованным формам имен и сообщений;
- search by entity: автор, тема, тред, закреп, опрос, реакция;
- фильтры по времени в локальном часовом поясе;
- быстрые срезы по важным участникам и типам сообщений.

### 5. Русскоязычный sentiment / tone analysis

- адаптированный словарь и модель под RU-корпус;
- учет отрицаний и усилителей;
- отдельные классы: нейтрально, позитивно, негативно, конфликтно, токсично, шуточно;
- снижение ложных срабатываний на коротких сообщениях вроде `ок`, `да`, `+1`, `угу`.

---

## Roadmap P0 / P1 / P2

### P0 — критично для продукта и качества

1. **Runtime/tooling stabilization**
   - зафиксировать Node LTS;
   - `engines.node` и CI Node 20 уже добавлены;
   - `typecheck` уже добавлен;
   - `packageManager`, `lint`, `test:ci` остаются следующими шагами.

2. **Telegram parser hardening**
   - nested entities, polls и reactions уже покрыты parser tests;
   - service actions остаются следующим parser-hardening шагом;
   - явно описать поддерживаемые и неподдерживаемые Telegram fields;
   - предотвратить non-string leaks в `textContent`.

3. **Timezone-first обработка**
   - явная модель времени для Telegram;
   - выбор timezone отчета;
   - корректные day boundaries и activity charts.

4. **Русский NLP baseline**
   - лемматизация RU;
   - `ё/е` normalization;
   - RU stopwords + чатовые стоп-слова;
   - search-format слой для кириллицы.

### P1 — сильное улучшение ценности

1. **Telegram feature completeness**
   - richer reaction dashboards;
   - forwards;
   - polls;
   - pins;
   - group calls;
   - service event analytics.

2. **Диалоговая аналитика**
   - reply graph;
   - conversational density;
   - response latency;
   - centrality/participation scores.

3. **Topic modeling**
   - биграммы/триграммы;
   - тематические кластеры по RU-корпусу;
   - темы по времени.

4. **UX и навигация**
   - улучшенный поиск;
   - понятные русские дашборды;
   - подсказки и объяснимость метрик.

### P2 — стратегическое развитие

1. **Мультиязычная аналитика**
   - RU/EN mixed-language insights;
   - language-segmented metrics;
   - кросс-языковые темы.

2. **Advanced analytics**
   - trend detection;
   - anomaly detection;
   - user cohort analysis;
   - retention/engagement over time.

3. **Enterprise-grade packaging**
   - reproducible builds;
   - подписанные релизы;
   - dependency automation;
   - supply-chain hardening.

---

## План 0-30 / 30-60 / 60-90 дней

### 0-30 дней

Цель: убрать наиболее острые риски воспроизводимости и качества.

- зафиксировать runtime-политику:
  - Node LTS в CI — выполнено для Node 20.x;
  - `engines` — выполнено для Node 20;
  - `packageManager` — оставить как следующий низкорисковый шаг после выбора Corepack-политики;
- снизить supply-chain риск:
  - убрать внешний Google Drive ZIP из CI или добавить checksum;
- добавить quality gates:
  - `typecheck` — выполнено;
  - `lint`;
  - `test:ci`;
- закрыть Telegram parser gaps:
  - nested entities — выполнено;
  - poll question parsing — выполнено;
  - reactions parsing — выполнено;
  - service message tests;
  - timezone-sensitive tests;
- документировать ограничения текущего отчета.

### 30-60 дней

Цель: дать заметную ценность для русскоязычного Telegram.

- добавить RU NLP baseline:
  - лемматизация;
  - `ё/е`;
  - stopwords;
  - улучшенный token search;
- расширить Telegram analytics:
  - replies graph;
  - forwards;
  - polls;
  - pins;
  - service event analytics;
- улучшить отчеты:
  - Telegram-centric blocks;
  - русские summaries;
  - coverage indicators по блокам;
- начать рефакторинг ядра:
  - выделить processing context;
  - уменьшить связность `DatabaseBuilder` / `MessageProcessor`.

### 60-90 дней

Цель: вывести продукт из уровня “генератор статистики” в “аналитический инструмент”.

- topic modeling и n-gram analytics;
- noise/bot quality layer;
- advanced interaction analytics;
- RU-локализация UI;
- security/ops hardening;
- dependency update automation;
- repeatable release process.

---

## Метрики приемки

### Технические метрики

- `npm ci` проходит без ручных исправлений;
- `build:node` и `build:web` проходят в CI;
- parser tests стабильно зеленые;
- report generation проходит на Telegram sample export без ошибок;
- размер HTML остается приемлемым для локального открытия;
- время генерации не деградирует на крупных экспортных файлах.

### Telegram-функциональные метрики

- service events покрывают согласованный список сущностей;
- forwards/replies/polls/pins имеют отдельные аналитические блоки;
- timezone-aware метрики совпадают с контрольными выборками;
- reactions извлекаются парсером и проходят parser regression test; отдельные report cards остаются продуктовым развитием.

### RU/NLP метрики

- поиск по русским словам на леммах находит ожидаемые формы;
- `ё/е` не ломает поиск и агрегаты;
- короткие сообщения меньше шумят в language detection;
- sentiment на RU-выборке стабилен и объясним;
- topic clusters проходят ручную проверку качества.

### Продуктовые метрики

Пользователь должен быстро отвечать на вопросы:

- кто самые активные участники;
- где идут основные диалоги;
- какие темы доминируют;
- какие периоды самые активные;
- что является шумом, а что содержательной коммуникацией;
- какие сообщения/темы запускают обсуждения.

---

## Privacy/security notes

- Репозиторий и локальные артефакты следует считать чувствительными, если внутри есть реальные chat exports.
- `OUT/report.html` содержит embedded report data и потенциально может раскрывать содержимое переписки.
- Нельзя коммитить реальные экспорты из `IN/` и реальные отчеты из `OUT/`.
- В публичных демо следует использовать синтетические или обезличенные данные.
- Даже агрегаты могут деанонимизировать участников маленького чата.
- CI demo input из внешнего источника должен быть заменен на проверяемый артефакт или fixture.
- Для production-версии желательно:
  - минимизировать логирование;
  - не включать сырой текст в error messages;
  - документировать, какие поля сохраняются в отчете;
  - добавить privacy-safe demo mode.

---

## Appendix: file references

### Core pipeline

- `pipeline/index.ts`
- `pipeline/Types.ts`
- `pipeline/Time.ts`
- `pipeline/Languages.ts`
- `pipeline/Env.ts`

### Parsing

- `pipeline/parse/index.ts`
- `pipeline/parse/Parser.ts`
- `pipeline/parse/File.ts`
- `pipeline/parse/Types.ts`
- `pipeline/parse/parsers/TelegramParser.ts`
- `pipeline/parse/parsers/Telegram.d.ts`
- `pipeline/parse/parsers/DiscordParser.ts`
- `pipeline/parse/parsers/MessengerParser.ts`
- `pipeline/parse/parsers/WhatsAppParser.ts`

### Processing / NLP

- `pipeline/process/DatabaseBuilder.ts`
- `pipeline/process/MessageProcessor.ts`
- `pipeline/process/ChannelMessages.ts`
- `pipeline/process/IndexedMap.ts`
- `pipeline/process/Types.ts`
- `pipeline/process/nlp/Text.ts`
- `pipeline/process/nlp/Sentiment.ts`
- `pipeline/process/nlp/Tokenizer.ts`
- `pipeline/process/nlp/Emojis.ts`
- `pipeline/process/nlp/Stopwords.ts`
- `pipeline/process/nlp/FastTextModel.ts`

### Aggregation

- `pipeline/aggregate/Blocks.ts`
- `pipeline/aggregate/Helpers.ts`
- `pipeline/aggregate/Filters.ts`
- `pipeline/aggregate/blocks/*`

### Serialization / compression

- `pipeline/serialization/MessageSerialization.ts`
- `pipeline/serialization/MessageView.ts`
- `pipeline/serialization/MessagesArray.ts`
- `pipeline/serialization/IndexCountsSerialization.ts`
- `pipeline/serialization/BitStream.ts`
- `pipeline/compression/Compression.ts`
- `pipeline/compression/Base91.ts`

### Report UI

- `report/index.tsx`
- `report/ReportPage.tsx`
- `report/WorkerWrapper.ts`
- `report/WorkerReport.ts`
- `report/BlockStore.ts`
- `report/components/*`

### App builder UI

- `app/index.tsx`
- `app/WorkerApp.ts`
- `app/WebEnv.ts`
- `app/components/*`

### Docs

- `docs/README.md`
- `docs/PIPELINE.md`
- `docs/PARSER.md`
- `docs/DEV.md`
- `docs/TESTS.md`
- `docs/CHANGELOG.md`
- `docs/REPOSITORY_ANALYSIS_RU.md`

### Build / CI

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `tsconfig.web.json`
- `webpack.config.js`
- `.github/workflows/cicd.yml`
- `.github/workflows/preview.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/docker.yml`

### Local generated artifacts

- `IN/telegram_export_2026-04-18/result.json`
- `OUT/report.html`
- `IN/README.md`
- `OUT/README.md`

Эти локальные артефакты нужны для проверки текущего поведения, но не должны попадать в публичный git history.
