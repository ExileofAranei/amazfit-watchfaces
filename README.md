# amazfit-watchfaces

Циферблаты для Zepp OS (Amazfit), написанные на TypeScript. Монорепо: переиспользуемые компоненты,
SVG→PNG конвейер ассетов и обёртка над Zeus CLI.

Первая целевая модель — **Amazfit Active Max** (Zepp OS 5.0, 480×480).

## Быстрый старт

```bash
npm install
npm run typecheck
npm run build -w faces/<name>     # → faces/<name>/dist/*.zab
npm run preview -w faces/<name>   # QR-код для установки на часы через Zepp (нужен `npx zeus login`)
```

Требования: Node.js ≥ 22. Zeus CLI ставится локально как dev-зависимость.

## Устройство

См. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

- `packages/core` — компоненты циферблатов (`createSegmentClock`, `createBackground`, …) и типы Zepp API.
- `packages/tooling` — CLI `wf` (`assets`, `bundle`, `build`, `preview`, `dev`).
- `faces/*` — циферблаты.

## Лицензия

Код — [MIT](LICENSE). Шрифты в `fonts/` распространяются под своими лицензиями (SIL OFL 1.1).

## Циферблаты

| Каталог | Описание |
|---|---|
| [faces/dm-replica](faces/dm-replica) | Копия циферблата DM (автор larrabee777) для Active Max. См. README внутри. |

Установка на часы и симулятор: [docs/INSTALL.md](docs/INSTALL.md).
