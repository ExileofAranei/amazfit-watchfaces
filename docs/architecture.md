# Архитектура

Монорепо циферблатов Zepp OS на TypeScript.

## Целевая платформа (первая)

| Параметр | Значение | Источник |
|---|---|---|
| Устройство | Amazfit Active Max | docs: reference/related-resources/device-list |
| deviceSource | `10813697`, `10813699` | там же |
| Экран | 480×480, круглый AMOLED, design width 480 | там же |
| Превью циферблата | 324×324 | там же |
| API | 4.2 по документации, 4.4 по живому списку устройств Zeus | device-list, `devices.json` |
| ОС | Zepp OS 5.0 | device-list |

## Структура

```
packages/core       общие компоненты циферблатов (TS) + типы Zepp API (types/zos.d.ts)
packages/tooling    CLI `wf`: SVG→PNG, бандл TS (esbuild), обёртка над zeus build/preview/dev
faces/<name>/       один Zeus-проект на циферблат
  face-config.ts    какие SVG и в каком размере рендерить, точки входа TS
  app.json          манифест Zepp
  src/              TS-исходники (layout.ts, watchface.ts, app.ts)
  art/              SVG-исходники ассетов
fonts/              шрифты для рендера надписей (только свободные лицензии)
```

- npm workspaces: `packages/*`, `faces/*`.
- В git попадает только то, что нужно для сборки. Сгенерированные `assets/`, `app.js`, `watchface/` и
  `dist/` в git не хранятся.
- Референсы, скриншоты и черновики лежат вне репозитория.

## TypeScript
- Zeus CLI (1.10.x) TypeScript не поддерживает: zpm обрабатывает только `.js`.
- `wf bundle` собирает TS через esbuild (`format=esm`, `target=es2020`, `external: ['@zos/*']`) в `app.js` и
  `watchface/index.js`, затем `zeus build`.
- Проверка типов: `npm run typecheck` (`tsc --noEmit`).
- `@zeppos/device-types@4.0.0` не покрывает виджеты циферблатов (`IMG_TIME`, `IMG_WEEK`, `IMG_DATE`,
  `IMG_STATUS`, `IMG_CLICK`, `show_level`, часть `data_type`). Поэтому используем свои минимальные
  объявления в `packages/core/types/zos.d.ts`. Каждый член добавляется со ссылкой на документацию.
  Методы не выдумываем.

## Zepp OS API
- Используем только модули `@zos/*`. Глобальные `hmUI`, `hmSensor` и `hmSetting` из v1 не используем.
- Опорный официальный пример: `zeppos-samples/watchface/3.0/timer` (configVersion v3).
- AOD описывается в том же `index`. У каждого виджета задаётся `show_level` (`ONLY_NORMAL` / `ONAL_AOD`).
  В AOD горит не больше 10% пикселей, фон чёрный, без градиентов (docs: watchface/specification).
- Ассеты кладутся в `assets/<target key из app.json>/`.

## Сборка и проверка
- `npm run build -w faces/<name>`: PNG → бандл → `zeus build` → `faces/<name>/dist/*.zab`.
- Docker-образ (Node 24 + Zeus) для воспроизводимой сборки — в планах.
- Симулятор: `.deb` v2.1.2 в WSL через WSLg.
- Окончательная проверка на часах: `npm run preview -w faces/<name>` (нужны `zeus login` и режим
  разработчика в Zepp: Профиль → Настройки → О приложении → 7 раз тапнуть по иконке).

## Неподтверждённое
- Работа симулятора под WSL2/WSLg и наличие в нём профиля Active Max.
- Подходят ли значения `apiVersion` из примера 3.0 (`2.0`) для Active Max. Поднимаем после проверки на часах.
- Работает ли `TEXT` с собственным `.ttf` на циферблатах. Пока используем картинки.
- Какие системные приложения можно открыть тапом с циферблата.

## Переиспользование между циферблатами
- Циферблат может отдавать части другим: экран — функцией в `src/` (например, `buildNormalScreen` в
  `faces/segment/src/normal.ts`, `buildNothing` в `faces/nothing/src/screen.ts`), ассеты — функцией в
  `assets.ts`, которая принимает путь до своего каталога (`base`) и, при необходимости, папку вывода (`root`).
- Комбинированный циферблат (`faces/segue`) только импортирует эти функции. Копии кода и SVG не делаем,
  чтобы правка в одном месте доходила до всех циферблатов.
