# amazfit-watchfaces

Циферблаты для Zepp OS (Amazfit), написанные на TypeScript. Монорепо: переиспользуемые компоненты,
SVG→PNG конвейер ассетов и обёртка над Zeus CLI.

Первая целевая модель — **Amazfit Active Max** (Zepp OS 5.0, 480×480).

## Быстрый старт

Для запуска нужны Docker Compose и `just`.

```bash
just install            # образ + зависимости
just login              # вход в Zepp Open Platform
just status             # проверить вход
just build segment       # → faces/<face>/dist/*.zab
just preview segment     # QR-код для установки на часы через Zepp
just mock segment        # офлайн-превью PNG
```

Или локально, если Node.js ≥ 22 установлен: `npm install`, затем `npm run build -w faces/<face>` и т. д.

## Устройство

См. [docs/architecture.md](docs/architecture.md).

- `packages/core` — компоненты циферблатов (`createSegmentClock`, `createBackground`, …) и типы Zepp API.
- `packages/tooling` — CLI `wf` (`assets`, `bundle`, `build`, `preview`, `dev`).
- `faces/*` — циферблаты.

Правила именования файлов и оформления коммитов описаны в [стиле кода](code-style.md).

## Лицензия

Код — [MIT](license). Шрифты в `fonts/` распространяются под своими лицензиями (SIL OFL 1.1).

## Циферблаты

| Каталог | Описание |
|---|---|
| [faces/segment](faces/segment) | Копия циферблата DM (автор larrabee777) для Active Max. См. README внутри. |

Установка на часы и симулятор: [docs/install.md](docs/install.md).
