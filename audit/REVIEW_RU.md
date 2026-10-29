# Ревью проекта CyberpunkCharSheetG

Дата: **30 октября 2026 года**  
Проверенная ревизия: **`d3d214c`** (`master`)  
Статус: код приложения не изменялся; добавлен только этот отчёт.

> В рабочем дереве уже было изменение `package.json` (`packageManager: pnpm`). Оно не является частью ревью и не изменялось.

## Резюме

Проект собирается, тесты проходят, импорт каталогов воспроизводим. Архитектура в целом аккуратная: типы, данные, утилиты и компоненты разделены, есть регрессионные тесты, защита повреждённых сохранений и проверка импортируемых данных.

При этом остаются проблемы, которые влияют на сохранность данных, видимые сценарии и точность игровых расчётов:

- нового персонажа можно создать с пустым именем, после чего автосохранение перестаёт работать;
- старый имплант с `isInstalled: true` без слота может повторно списать Humanity;
- импорт массива персонажей заменяет коллекцию без подтверждения и без удобного восстановления предыдущей;
- кнопки «Каталог DataPool» из разделов открывают не тот раздел магазина;
- `SectionNav` может уронить приложение при недоступном `localStorage`;
- проверки управления транспортом считаются по неверной базе;
- есть уязвимости зависимостей, а включённый `html: true` в Markdown-заметках попадает под advisory квадратичного DoS.

## Выполненные проверки

| Проверка | Результат |
|---|---|
| `npm test` | **141/141 тест прошёл**, около 6,1 с |
| `npm run build` | Успешно; `tsc` и production-сборка проходят |
| Размер production-бандла | **2 523,06 kB**, gzip **583,01 kB**; Vite предупреждает о крупном чанке |
| `python scripts/import-weapons.py --check` | Успешно: 200 оружий, 84 профиля |
| `python scripts/import-cyberware.py --check` | Успешно: 173 записи |
| `python scripts/import-gear.py --check` | Успешно: 261 предмет |
| `python scripts/import-vehicles.py --check` | Успешно: 59 машин |
| `python scripts/import-ammunition.py --check` | Успешно: 114 предложений |
| `python scripts/import-grenades.py --check` | Успешно: 18 гранат |
| `npm audit --omit=dev` | **2 уязвимости**: 1 critical, 1 high |
| `tsc --noUnusedLocals --noUnusedParameters` | Около **70** неиспользуемых объявлений |
| Браузерные E2E-тесты | Не запускались; тестовый harness подменяет React hooks и `useEffect` |

Важно: 141 успешный тест — это регрессионная проверка, а не сертификация соответствия правилам Cyberpunk RED и не браузерное E2E-тестирование. Harness в `tests/helpers.cjs:16` делает `useEffect` пустым, поэтому lifecycle, autosave, `SectionNav` и Tiptap фактически не проверяются.

## P1 — данные и основные сценарии

### 1. Персонаж с пустым именем создаётся, но перестаёт сохраняться

**Где:** `src/components/CharacterWizardModal.tsx:247-257`, `:398`; `src/utils/characterValidation.ts:97`; `src/App.tsx:117-118`.

`handleCompleteCreation` проверяет очки характеристик, навыки, обязательные минимумы и бюджет, но не проверяет имя. После нажатия «CREATE CHARACTER» персонаж с `name: ''` добавляется в коллекцию.

При этом `isCharacter` требует непустое имя (`character.name.trim()`). Поэтому:

- персонаж отображается в интерфейсе;
- `saveCharactersToStorage` отклоняет всю коллекцию;
- в `App` появляется только общий баннер «Не удалось сохранить лист»;
- дальнейшие изменения не сохраняются.

Это воспроизведено через тестовый harness: очистка имени не блокирует создание, а созданный объект не проходит `isCharacter`.

**Исправление:** обязательное непустое имя (и желательно handle), блокировка кнопки создания до валидации, отдельное сообщение об ошибке. Также стоит не допускать сохранения пустого имени при редактировании листа в `StatsSection`.

### 2. Старый имплант без слота повторно списывает Humanity

**Где:** `src/utils/cyberware.ts:66-72`, `:250`; `README.md:34`; `audit/CYBERWARE_RU.md`.

В `isCyberwareInstalled` используется:

```ts
if (!item.installedIn?.length) return item.isInstalled === undefined;
```

Запись `{ isInstalled: true, installedIn: undefined }` считается **неустановленной**, хотя это старый установленный имплант. Затем `installCyberware` видит `alreadyInstalled === false` и списывает `humanityCost` ещё раз.

Воспроизведено: Neural Link с `isInstalled: true` без `installedIn`, Humanity 60 → **53** после назначения слота.

Это противоречит `README.md:34` и документации: повторная Humanity при переназначении старого импланта не должна списываться.

**Исправление:** мигрировать такие записи при загрузке или считать `isInstalled !== false` уже оплаченным. При первом назначении основания не списывать Humanity; отдельно синхронизировать cap loss и текущую Humanity.

### 3. Импорт массива заменяет коллекцию без подтверждения

**Где:** `src/App.tsx:190-194`; `src/utils/storage.ts:99-108`, `:14-17`.

При импорте массива выполняется:

```ts
setCharacters(parsed);
setActiveId(parsed[0]?.id || '');
```

Старая коллекция при следующем сохранении уходит в `cpr_characters_previous_v1`, но:

- пользователь не подтверждает замену;
- `hasStorageRecovery` проверяет только `recovery`-ключ, поэтому баннер о восстановлении не появляется;
- в UI нет кнопки «восстановить предыдущую коллекцию», хотя `exportStorageRecovery` умеет её выгрузить.

**Исправление:** подтверждение замены, явный выбор «заменить / объединить» и кнопка восстановления предыдущей коллекции.

### 4. Магазин не применяет `initialCategory` после первого монтирования

**Где:** `src/components/DataPoolShopModal.tsx:81`; `src/App.tsx:575`.

```ts
const [activeTab, setActiveTab] = useState<ShopTab>(initialCategory);
```

Модальное окно всегда смонтировано в `App`; при открытии из раздела оружия или имплантов изменяется только prop `initialCategory`, но состояние `activeTab` не обновляется.

Воспроизведено: модалка сначала смонтирована с `all`, затем открыта с `initialCategory: 'weapons'` — активной вкладки оружия нет, показываются все **872** позиции.

**Исправление:** синхронизировать `activeTab` через `useEffect` при открытии или монтировать модалку с `key` по `isOpen`/`initialCategory`.

### 5. `SectionNav` может уронить приложение при недоступном `localStorage`

**Где:** `src/components/SectionNav.tsx:85-94`; `src/main.tsx`.

`localStorage.getItem` и `localStorage.setItem` вызываются напрямую, без `try/catch`, включая инициализатор `useState`. В браузерах с заблокированным storage это исключение возникает до отрисовки приложения. Error Boundary в `main.tsx` отсутствует.

**Исправление:** использовать безопасные storage-helper-функции и добавить Error Boundary на верхнем уровне.

### 6. Проверки управления транспортом считаются по неверной базе

**Где:** `src/components/VehiclesSection.tsx:75-77`, `:208`, `:239`; `src/utils/rules.ts:28-34`, `:44-51`.

Проблемы:

- `hpMax` считается от сырых `character.stats.BODY/WILL`, а не через `maxHP`;
- порог ранения использует `hpCurrent <= seriouslyWoundedThreshold`, тогда как в остальном приложении и правилах — строго `меньше`;
- база вождения: `character.stats[statKey] + skillLvl + armorPenalty + woundPenalty + ...`, то есть не учитываются `statMods`, Moto Кочевника, Field Expertise Техника, `injuryActionPenalty` и корректный effective STAT;
- ремонт: `character.stats.TECH + skillLvl + woundPenalty` — та же проблема.

**Исправление:** использовать `effectiveStat`, `maxHP`, `woundPenalty` и `skillBase` из `src/utils/rules.ts`, добавляя только специфичные для машины модификаторы (`sdpPenalty`, `interfaceBonus`).

### 7. Уязвимости зависимостей и DoS через Markdown

**Где:** `package.json:27-36`; `src/components/NotesSection.tsx:64-70`.

`npm audit --omit=dev` сообщает:

- **critical** `dompurify@3.4.16` — несколько advisory, включая GHSA-cg2g-xh64-v4q7;
- **high** `markdown-it@14.3.2` — GHSA-vfgh-jcmw-g37q (квадратичное время разбора inline HTML при `html: true`) и GHSA-gfr2-rv44-r23c.

`markdown-it` реально используется через `tiptap-markdown`, а в `NotesSection` включено `html: true`. Специально составленный или импортированный текст заметки может привести к зависанию вкладки.

`dompurify` при этом нигде не импортируется в `src` — это лишняя зависимость, но её critical advisory всё равно ломает аудит.

**Исправление:**

- удалить `dompurify`, `@types/dompurify`, `marked`, `turndown`, `@types/turndown`, если они не нужны;
- обновить `markdown-it`/`tiptap-markdown`;
- рассмотреть `html: false` и/или ограничение размера заметок и санитизацию.

## P2 — правила, состояние и UX

### 8. Состояние модалок не сбрасывается

**Где:** `src/components/CharacterWizardModal.tsx:104-145`; `src/components/DataPoolShopModal.tsx:86`.

`CharacterWizardModal` остаётся смонтированным и хранит имя, роль, характеристики, навыки и выбранную экипировку между открытиями. После создания персонажа и повторного открытия видны старые данные; это же провоцирует случайное создание почти одинаковых персонажей.

`DataPoolShopModal` сохраняет поиск, сортировку и, что важнее, режим ГМ. Если пользователь забыл выключить бесплатную выдачу, следующая покупка снова будет бесплатной.

**Исправление:** сбрасывать состояние при закрытии/успешном создании или монтировать модалки с `key` по факту открытия.

### 9. Death Save: нет сброса штрафа, карточка показывает не тот BODY

**Где:** `src/App.tsx:237-240`; `src/components/DiceRollerModal.tsx:84-87`; `src/components/StatsSection.tsx:544-547`; `src/utils/rules.ts:40-42`.

Штраф увеличивается при каждом броске и нигде не сбрасывается после лечения или стабилизации. По правилам после стабилизации и возврата к 1 HP он сбрасывается до базового значения, увеличенного только тяжёлыми травмами.

Карточка Death Save показывает сырой `character.stats.BODY` и не показывает `injuryDeathPenalty`, хотя фактический бросок использует effective BODY и штраф травм.

**Исправление:** добавить действие «стабилизирован» или автоматический сброс при HP >= 1; показывать эффективный BODY и полный штраф.

### 10. При уменьшении BODY/WILL текущий HP может остаться выше максимума

**Где:** `src/components/StatsSection.tsx:98-121`; `src/utils/rules.ts:28-30`.

`handleStatChange` меняет характеристики, но не пересчитывает и не ограничивает `hpCurrent`. Если понизить BODY или WILL, `maxHP()` уменьшится, а текущий HP останется прежним. В итоге лист показывает, например, `40 / 35`.

**Исправление:** ограничивать `hpCurrent` новым `maxHP` при изменении BODY/WILL и при установке/снятии имплантов, меняющих BODY.

### 11. Валидатор импорта допускает дубликаты ID и отрицательные значения

**Где:** `src/utils/characterValidation.ts:95`, `:97`, `:117-120`, `:53`, `:35-40`, `:119`.

Проверяется уникальность только для оружия, имплантов и брони. Не проверяются дубликаты ID в:

- `gear`;
- `programs`;
- `vehicles`;
- `skills`;
- `criticalInjuries`.

Последствия: редактирование/удаление одной записи может затронуть несколько из-за поиска по `id`, а React-ключи дублируются.

Также принимаются:

- `roleRank` без диапазона — импорт с `roleRank: 999` даст, например, +999 к проверкам Nomad/Fixer;
- отрицательные `currentAmmo`;
- отрицательные `spMax`/`spCurrent` брони;
- отрицательные `sdpCurrent` транспорта;
- отрицательные `cashEb`/`bankEb`.

**Исправление:** расширить схему: уникальность всех списков, диапазоны ранга, HP, ammo, SP и денег.

### 12. Терапия применяется без оплаты, если не хватает денег

**Где:** `src/components/TherapyModal.tsx:70-94`.

Восстановление Humanity вычисляется и применяется всегда, а списание средств выполняется только при достаточной сумме. Если денег нет, `costPaid = 0`, но терапия всё равно применяется. Кроме того, модалка не выполняет проверку Медтеха, хотя показывает требование СЛ15/17.

**Исправление:** блокировать сеанс при недостатке средств или явно предлагать бесплатный режим; отдельно добавить проверку Медтеха или пометить её как ручную.

### 13. Улучшения транспорта обходят стоимость, ранг и категорию

**Где:** `src/components/VehiclesSection.tsx:120-147`; `src/components/DataPoolShopModal.tsx:304-326`.

- В карточке машины улучшение добавляется бесплатно, без проверки `costEb`, `nomadRank` и `applicableCategory`.
- В глобальном магазине улучшение устанавливается на **первую машину в гараже**, без выбора автомобиля и без проверки совместимости. Если машин нет, улучшение попадает в `gear`.

**Исправление:** выбирать конкретный транспорт, проверять категорию/ранг и списывать стоимость.

### 14. Несколько правил ролей реализованы неточно

**Fixer, бонус Trading.** `getRoleSkillBonus` добавляет ранг к `trading` для любой проверки Торговли (`src/utils/roleUtils.ts:38-44`), хотя по книге ранг добавляется только при торге. В `SkillsSection` обычный бросок Trading тоже получает этот бонус.

**Fixer reach.** `fixerReach` (`src/utils/roleAbilities.ts:7`) возвращает денежные суммы («20 eb», «500 eb»), а в книге охват описан категориями предметов (дешёвые/повседневные/дорогие/роскошь/супер-роскошь). `src/components/RoleActions.tsx:36-44` выводит эти суммы как правило.

**Nomad, семейный автопарк.** Таблица в `src/components/RoleSection.tsx:468-483` не соответствует книге:

- книга: ранги 1–4 — автомобиль, гирокоптер, гидроцикл, дорожный мотоцикл; 5–6 — вертолёт, спорткар, скоростной катер; 7–8 — AV-4, круизный катер, спортивный мотоцикл; 9–10 — дирижабль, AV-9, суперкар, яхта;
- приложение: ранг 1 ограничен мотоциклом/гидроциклом, 2–3 — компактным авто и т. д.

**Weapons/Throw.** `handleRollThrow` наносит BODY напрямую (`src/components/WeaponsSection.tsx:221-223`), а подпись рядом обещает «полный урон безоружной атаки» (`:677-678`). Текст и действие расходятся.

**DLC-приёмы.** `wrestling_choke` и `yukon_crack_skulls` вызывают `onRollCustomCheck` с базой BODY вместо `onRollCustomDamage` (`:294-307`), то есть вместо прямого урона выполняется проверка без DV.

### 15. Производительность: полная валидация и запись коллекции на каждое нажатие

**Где:** `src/components/NotesSection.tsx:78-82`; `src/App.tsx:117-119`; `src/utils/storage.ts:95-110`; `src/components/DataPoolShopModal.tsx:91`, `:218`.

`NotesSection` на каждый `onUpdate` вызывает `onUpdateCharacter`. Далее `App` обновляет `characters`, а эффект синхронно вызывает `saveCharactersToStorage`, который делает `isCharacterCollection` и `JSON.stringify` всей коллекции.

Для длинных заметок это означает полную проверку и запись LocalStorage на каждый символ. Нужен debounce сохранения (например, 300–500 мс) с принудительным flush на `beforeunload`.

Дополнительно `DataPoolShopModal` строит объединённый список из **872** позиций через `useMemo` ещё до проверки `if (!isOpen)`, а модалка всегда смонтирована в `App`. Стоит лениво монтировать магазин и/или вынести каталоги в динамические импорты.

### 16. Печать: печатается только активная вкладка, тёмная тема не адаптирована

**Где:** `src/components/Header.tsx:345-352`; `src/App.tsx:431-524`; `src/index.css:166-178`.

`Header` вызывает `window.print()`, но `App` рендерит только активную вкладку. Поэтому «Печать листа» печатает текущий раздел, а не весь лист.

В `@media print` меняются только `body` и скрываются `.no-print`; цвета карточек и текста остаются экранными. При печати без фона текст может быть светлым на белом.

**Исправление:** отдельный print-стиль или режим «печать всего листа».

### 17. Сломанный favicon и заявка «100% Offline»

**Где:** `index.html:5`, `:8-11`; `src/App.tsx:588`.

`index.html` ссылается на `./vite.svg`, но в `public` есть только `favicon.svg` и `icons.svg`; `vite.svg` лежит в `src/assets` и по этому URL не отдаётся. Favicon будет 404. Нужно заменить на `./favicon.svg` (и либо использовать, либо удалить `public/icons.svg`).

Google Fonts подключаются из сети, а футер заявляет «100% Offline». В офлайне приложение останется работоспособным, но кастомные шрифты не загрузятся. Либо self-host шрифты, либо скорректировать формулировку.

### 18. Доступность и отсутствие Error Boundary

- Карточки выбора метода/роли в конструкторе — `<div onClick>` (`CharacterWizardModal.tsx:467, 493, 519`), а не кнопки. С клавиатуры выбрать метод/роль нельзя.
- Карточки травм в `src/components/InjuriesSection.tsx:499-503` тоже `<div onClick>` без `role`, `tabIndex` и обработки Enter/Space.
- Модальные окна в основном не имеют focus trap, закрытия по Escape и корректного `aria-modal`/`aria-labelledby`.
- В `src/main.tsx` нет Error Boundary; одно исключение может оставить пустой весь экран.
- `html lang="ru"` жёстко задан в `index.html:2`; переключатель языка не обновляет `document.documentElement.lang`.

### 19. Мусор в зависимостях и коде

**Где:** `package.json:27-36`; `src/assets/*`; `public/icons.svg`; `tsconfig.json:22-23`; `package.json:38`; `.github/workflows/deploy.yml:31-34`.

Неиспользуемые зависимости:

- `dompurify` и `@types/dompurify`;
- `marked`;
- `turndown` и `@types/turndown`.

Неиспользуемые ассеты:

- `src/assets/hero.png`;
- `src/assets/typescript.svg`;
- `src/assets/vite.svg`;
- `public/icons.svg`.

`tsc --noEmit --noUnusedLocals --noUnusedParameters` выдаёт около **70** ошибок «declared but never read»: неиспользуемые иконки в `App`, `RoleSection`, `CharacterWizardModal`, `CyberwareSection`, `VehiclesSection`, `WeaponsSection` и др. В `tsconfig.json` `noUnusedLocals`/`noUnusedParameters` выключены, линтера нет.

Процессный момент: `package.json:38` объявляет `packageManager: pnpm`, а репозиторий и workflow используют `package-lock.json` и `npm ci`. Нужно выбрать один менеджер: либо npm и убрать поле, либо pnpm и добавить `pnpm-lock.yaml` + обновить workflow.

## Что тесты не ловят

141 тест — хорошая база, но harness в `tests/helpers.cjs:16` делает `useEffect` пустым, поэтому не проверяются:

- автосохранение и поведение при ошибке записи;
- `SectionNav` и прямой `localStorage`;
- жизненный цикл модалок (сброс состояния, `initialCategory`, режим ГМ);
- Tiptap/Markdown и реальный DOM;
- печать и CSS.

Браузерные E2E-тесты отсутствуют. Для найденных проблем стоит добавить тесты на:

- создание персонажа с пустым именем;
- импорт массива без подтверждения и восстановление предыдущей коллекции;
- старый имплант `isInstalled: true` без слота;
- открытие магазина с `initialCategory`;
- повторное открытие конструктора;
- Death Save reset и HP clamp;
- дубликаты/отрицательные значения в импорте;
- оплату терапии;
- базу проверок транспорта.

## Сильные стороны

- Чёткое разделение `types` / `data` / `utils` / `components`.
- Хорошая проработка хранения: валидация перед записью, резервные копии, recovery-механизм.
- Тесты действительно загружают реальные TS-модули и обработчики, а не только чистые функции.
- Импорт каталогов воспроизводим: все `--check` проходят.
- TypeScript strict и успешная production-сборка.
- Относительный `base: './'` и workflow корректно ориентированы на GitHub Pages.

## Рекомендуемый порядок исправлений

1. **Данные:** пустое имя, подтверждение импорта, миграция старых имплантов, расширение `isCharacter` (уникальность ID, диапазоны).
2. **Основные сценарии:** `initialCategory` магазина, сброс состояния модалок, безопасный `localStorage` в `SectionNav`.
3. **Правила и расчёты:** `VehiclesSection` через `skillBase`/`maxHP`, Death Save reset/display, HP clamp, терапия, Fixer/Moto и DLC-приёмы.
4. **Безопасность:** `npm audit fix`, удаление `dompurify`/`marked`/`turndown`, обновление `markdown-it`, отключение `html: true` или санитизация заметок.
5. **Производительность и UX:** debounce autosave, ленивое монтирование магазина, code splitting каталогов, печать всего листа, favicon/offline-формулировки.
6. **Качество:** ESLint/Prettier, `noUnusedLocals`, Error Boundary, доступность модалок и кликабельных карточек, E2E-тесты.

## Быстрый список файлов для первоочередной правки

- `src/components/CharacterWizardModal.tsx`
- `src/utils/cyberware.ts`
- `src/App.tsx`
- `src/components/DataPoolShopModal.tsx`
- `src/components/SectionNav.tsx`
- `src/components/VehiclesSection.tsx`
- `src/components/StatsSection.tsx`
- `src/components/TherapyModal.tsx`
- `src/utils/characterValidation.ts`
- `src/components/NotesSection.tsx`
- `src/utils/roleUtils.ts`
- `src/utils/roleAbilities.ts`
- `src/components/RoleSection.tsx`
- `src/index.css`
- `index.html`
- `package.json`
