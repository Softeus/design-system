# DS — Design System

[![Chromatic](https://img.shields.io/badge/Chromatic-Published-blue)](https://www.chromatic.com/library?appId=6a0d6b6f1ae93379125eb7ae)

Библиотека React UI-компонентов с полноценным дизайн-токен-пайплайном, собранным на **Vite + Storybook 10**, с поддержкой светлой и тёмной тем. Проект использует **CSS Modules** для стилизации и **CSS Custom Properties** (дизайн-токены) для темизации.

---

## Оглавление

- [Архитектура](#архитектура)
- [Стек технологий](#стек-технологий)
- [Структура проекта](#структура-проекта)
- [Дизайн-токены](#дизайн-токены)
- [Компоненты](#компоненты)
  - [Button](#button)
  - [Input](#input)
- [Темизация (Light / Dark)](#темизация-light--dark)
- [Инструменты и конфигурация](#инструменты-и-конфигурация)
  - [Storybook](#storybook)
  - [Тестирование](#тестирование)
  - [CI/CD — Chromatic](#cicd--chromatic)
  - [TypeScript](#typescript)
  - [Пакетный менеджер](#пакетный-менеджер)
- [Установка и запуск](#установка-и-запуск)
  - [Требования](#требования)
  - [Установка зависимостей](#установка-зависимостей)
  - [Основные команды](#основные-команды)
- [Как добавить новый компонент](#как-добавить-новый-компонент)
- [План развития](#план-развития)
- [Лицензия](#лицензия)

---

## Архитектура

Проект построен на трёхслойной архитектуре токенов:

```
┌──────────────────────────────────────────────┐
│                 tokens.json                   │  ← Исходные токены (Figma Tokens)
├──────────────────────────────────────────────┤
│         scripts/build-tokens.js               │  ← Сборка (Style Dictionary)
├──────────────────┬───────────────────────────┤
│   primitives/    │  semantic/light, /dark     │  ← Уровни токенов
│   value          │                            │
├──────────────────┴───────────────────────────┤
│  CSS Custom Properties (--ds-*) + tokens.d.ts │  ← Сгенерированные артефакты
├──────────────────────────────────────────────┤
│            Компоненты (Button, Input, ...)    │  ← Потребляют токены через var(--ds-...)
└──────────────────────────────────────────────┘
```

1. **Примитивы** (`primitives/value`) — сырые значения: цвета (Blue Ribbon, Black, Coral Red, Pizazz, Jade), типографика (шрифты, размеры, межстрочные), скругления.
2. **Семантические токены** (`semantic/light`, `semantic/dark`) — осмысленные токены, привязанные к контексту: `--ds-surface-brand-color`, `--ds-text-color`, `--ds-border-danger-color` и т.д.
3. **Компоненты** — потребляют семантические токены через `var(--ds-имя-токена)` в CSS Modules. Прямых ссылок на примитивы нет.

Компоненты используют **CSS Modules** (`.module.css`). Стили инкапсулированы, имена классов хешируются Vite на лету.

---

## Стек технологий

| Технология | Версия | Назначение |
|---|---|---|
| React | — (peer, через Storybook) | UI-компоненты |
| TypeScript | 5.x (strict mode) | Типизация |
| Vite | — (через `@storybook/react-vite`) | Сборка (dev/build Storybook) |
| Storybook | 10.4 | Среда разработки и документация компонентов |
| Style Dictionary | 5.4 | Генерация CSS-переменных и TypeScript-типов из JSON-токенов |
| CSS Modules | — (встроены в Vite) | Инкапсуляция стилей компонентов |
| Vitest | 4.1 | Unit/браузерное тестирование |
| Playwright | 1.60 | Браузерное тестирование (Chromium) |
| Chromatic | 17.x | Визуальное регрессионное тестирование |
| pnpm | — | Пакетный менеджер (через `pnpm-workspace.yaml`) |

Все зависимости являются **devDependencies** — библиотека не имеет рантайм-зависимостей.

---

## Структура проекта

```
ds/
├── .github/
│   └── workflows/
│       └── chromatic.yml              # CI: автопубликация в Chromatic при пуше в main
├── .storybook/
│   ├── main.js                         # Конфигурация Storybook (addons, stories glob)
│   └── preview.jsx                     # Глобальные настройки: тема, фон, a11y, decorators
├── scripts/
│   └── build-tokens.js                 # Сборщик дизайн-токенов (Style Dictionary, 280 строк)
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx              # Компонент Button
│   │   │   ├── Button.module.css       # Стили Button (176 строк)
│   │   │   └── Button.stories.tsx      # Storybook-истории (13 сценариев, 226 строк)
│   │   └── Input/
│   │       ├── Input.tsx               # Компонент Input
│   │       ├── Input.module.css        # Стили Input (142 строки)
│   │       └── Input.stories.tsx       # Storybook-истории (9 сценариев, 77 строк)
│   ├── styles/
│   │   ├── tokens.css                  # Агрегат: импорт всех токенов + глобальный transition
│   │   ├── primitives.css              # Сгенерированные примитивные токены (187 строк)
│   │   ├── semantic-light.css          # Сгенерированная светлая тема (40 строк)
│   │   └── semantic-dark.css           # Сгенерированная тёмная тема (40 строк)
│   ├── types/
│   │   └── tokens.d.ts                 # Сгенерированные TS-типы токенов (433 строки)
│   ├── index.ts                        # Баррель-экспорт (пока только Button)
│   └── vite-env.d.ts                   # Декларации Vite + CSS Modules
├── tokens/
│   └── tokens.json                     # Исходные дизайн-токены (формат Figma Tokens, 1863 строки)
├── storybook-static/                   # Собранный Storybook (статический билд)
├── package.json
├── tsconfig.json
├── vitest.config.js                    # Конфигурация Vitest + Playwright + Storybook Test
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package-lock.json
├── readme.md                            # Этот файл
├── stories.txt                          # Кеш/референс старых шаблонов Storybook (не используется)
└── .gitignore
```

### Что в `.gitignore`

```
node_modules
storybook-static
dist
build
.env
.DS_Store
*.log
```

---

## Дизайн-токены

### Исходный файл

`tokens/tokens.json` — экспорт из плагина **Figma Tokens**. Содержит три набора:

- **`primitives/value`** — примитивные значения:
  - Цвета: Blue Ribbon, Black, Coral Red, Pizazz (оранжевый), Jade (зелёный)
  - Каждый цвет — 11–17 оттенков (50, 100, 200, ..., 950, 1000)
  - Типографика: семейства шрифтов (Inter), размеры, межстрочные интервалы, насыщенности
  - Готовые типографические стили: heading-h2, h3, h4, h5, h6, body-l, body-m, body-s, body-s-b, body-xs
  - Скругления, межбуквенные расстояния, отступы абзацев

- **`semantic/light`** — семантические токены для светлой темы:
  - `border`: brand, neutral-soft, neutral-light, danger
  - `surface`: transparent, brand (+hover/active), brand-pale, brand-light, neutral-pale (+hover), neutral-light (+hover/active/disabled), danger, danger-pale, success, success-pale, overlay-static, pure, warning
  - `text`: color, soft, static, inversed, inversed-static, brand (+hover/active/disabled)

- **`semantic/dark`** — то же самое для тёмной темы. Отличаются значения `--ds-text-color` и `--ds-text-inversed-color` (инвертированы относительно светлой схемы).

### Сборка токенов

```bash
npm run build:tokens
```

Скрипт `scripts/build-tokens.js` делает следующее:

1. Читает `tokens/tokens.json`, удаляет Figma-метаданные (`$extensions`, `$themes`, `$metadata`).
2. Разворачивает **составные токены** (composite tokens) — токены с дочерними состояниями (`hover`, `active`, `disabled`) преобразуются в отдельные соседние токены: `color` + `color-hover` + `color-active`.
3. Исправляет относительные референсы (`{value}` → `{primitives/value.color.500}`).
4. Генерирует CSS-файлы через **Style Dictionary 5**:
   - `src/styles/primitives.css` — все примитивы на `:root`
   - `src/styles/semantic-light.css` — светлая тема на `:root, [data-theme="light"]`
   - `src/styles/semantic-dark.css` — тёмная тема на `[data-theme="dark"]`
5. Создаёт агрегат `src/styles/tokens.css` с `@import`-ами всех трёх файлов и глобальным transition-правилом.
6. Генерирует `src/types/tokens.d.ts` — TypeScript-типы:
   - `DesignToken` — union всех CSS-переменных (например `'--ds-text-color' | '--ds-surface-brand-color' | ...`)
   - `Theme` — `'light' | 'dark' | 'system'`
   - `ThemeTokens` — интерфейс с именами всех токенов

### Сгенерированные файлы

> **Не редактировать вручную!** Все файлы в `src/styles/primitives.css`, `semantic-light.css`, `semantic-dark.css` и `src/types/tokens.d.ts` перезаписываются при запуске `build:tokens`.

---

## Компоненты

### Button

**Файлы:**
- `src/components/Button/Button.tsx` — компонент (59 строк)
- `src/components/Button/Button.module.css` — стили (176 строк)
- `src/components/Button/Button.stories.tsx` — 13 историй (226 строк)

**Пропсы:**

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `variant` | `'filled' \| 'secondary' \| 'outlined' \| 'ghost' \| 'link'` | `'filled'` | Вид кнопки |
| `size` | `'xl' \| 'l' \| 'm'` | `'m'` | Размер кнопки |
| `fullWidth` | `boolean` | `false` | Растянуть на всю ширину контейнера |
| `icon` | `ReactNode` | — | Иконка (слева или справа от текста) |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Позиция иконки |
| `children` | `ReactNode` | — | Текст кнопки |
| ... | `ButtonHTMLAttributes` | — | Все нативные атрибуты `<button>` |

**Варианты:**

| Вариант | Описание | Фон | Текст |
|---|---|---|---|
| `filled` | Залитая, основной акцент | Brand | White |
| `secondary` | Второстепенная | Neutral Light | Основной |
| `outlined` | Обводка, прозрачный фон | Transparent + Brand border | Brand |
| `ghost` | Прозрачная, без обводки | Transparent | Основной |
| `link` | Как ссылка | Transparent | Brand (подчёркивание при hover) |

**Размеры:**

| Размер | Высота | Паддинг (верт. × гориз.) | Размер шрифта |
|---|---|---|---|
| `xl` | 56px | 16px × 24px | 16px |
| `l` | 48px | 12px × 24px | 16px |
| `m` | 40px | 8px × 24px | 14px |

**Состояния каждого варианта:** default, hover, active, disabled.

**Особенности:**
- **Icon-only mode:** если передан `icon` и нет `children`, кнопка становится квадратной (ширина = высоте).
- **Полная поддержка `aria-*` атрибутов** через рест-пропсы `...restProps`.
- **`displayName = 'Button'`** для лучшей отладки в React DevTools.
- Все цвета используют CSS-переменные (`var(--ds-...)`) с фоллбэками.

**Экспорт:**
```ts
export { Button } from './components/Button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button/Button';
```

---

### Input

**Файлы:**
- `src/components/Input/Input.tsx` — компонент (94 строки)
- `src/components/Input/Input.module.css` — стили (142 строки)
- `src/components/Input/Input.stories.tsx` — 9 историй (77 строк)

**Пропсы:**

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `size` | `'l' \| 'm'` | `'m'` | Размер инпута |
| `label` | `string` | — | Текст лейбла над полем |
| `helperText` | `string` | — | Подсказка под полем |
| `error` | `boolean` | `false` | Состояние ошибки (красная рамка + текст) |
| `clearable` | `boolean` | `false` | Показывать кнопку очистки (крестик) |
| ... | `InputHTMLAttributes` (кроме `size`) | — | Все нативные атрибуты `<input>` |

**Размеры:**

| Размер | Высота | Паддинг | Размер шрифта |
|---|---|---|---|
| `l` | 60px | 0 16px | 16px |
| `m` | 48px | 0 12px | 14px |

**Состояния:**
- **Default** — серый фон (`--ds-surface-neutral-light-color`), прозрачная рамка
- **Hover** — фон темнеет
- **Focus (Active)** — белый фон + brand-рамка (`--ds-border-brand-color`)
- **Error** — красная рамка (`--ds-border-danger-color`), серый фон
- **Error + Focus** — красная рамка, белый фон
- **Disabled** — серый фон, серый текст, `cursor: not-allowed`

**Особенности:**
- **Clearable:** при `clearable={true}` и наличии значения в поле справа появляется кнопка с SVG-крестиком. При клике эмулируется `onChange` с пустой строкой.
- **Accessibility:** `aria-invalid={error}`, `aria-describedby` связывает поле с helper-текстом, кнопка очистки имеет `aria-label="Clear input"`.
- **`React.forwardRef`** — поддерживает передачу рефа на нативный `<input>`.
- **`displayName = 'Input'`** для React DevTools.

**Экспорт:**

На данный момент компонент Input **не добавлен** в `src/index.ts`. Чтобы использовать:
```ts
import { Input } from './components/Input/Input';
```

---

## Темизация (Light / Dark)

Переключение темы — **чистый CSS**, без JS-провайдера. Используется data-атрибут на `<html>`:

```html
<html data-theme="light">  <!-- светлая тема (по умолчанию) -->
<html data-theme="dark">   <!-- тёмная тема -->
```

В Storybook переключение встроено через аддон **Backgrounds**:
- Light: фон `#ffffff` → `data-theme="light"`
- Dark: фон `#1c1e22`` → `data-theme="dark"`

Декоратор в `.storybook/preview.jsx` автоматически синхронизирует выбранный фон с data-атрибутом.

При интеграции в проект достаточно установить `data-theme` на `<html>` и подключить `tokens.css`.

---

## Инструменты и конфигурация

### Storybook

**Версия:** 10.4  
**Фреймворк:** `@storybook/react-vite` (использует Vite под капотом)

**Аддоны:**
| Аддон | Назначение |
|---|---|
| `@chromatic-com/storybook` | Интеграция с Chromatic (визуальное тестирование) |
| `@storybook/addon-vitest` | Запуск Vitest-тестов на основе Storybook stories |
| `@storybook/addon-a11y` | Проверка accessibility (режим `test: 'todo'`) |
| `@storybook/addon-docs` | Автогенерация документации по stories |
| `@storybook/addon-mcp` | Model Context Protocol для AI-интеграций |

**Поиск историй:** `src/components/**/*.stories.@(js|jsx|ts|tsx)` и `src/**/*.stories.@(js|jsx|ts|tsx)`.

**Запуск dev-сервера:**
```bash
npm run storybook
# Storybook запускается на http://localhost:6006
```

**Статическая сборка:**
```bash
npm run build-storybook
# Результат в storybook-static/
```

---

### Тестирование

#### Инфраструктура

Тестовая инфраструктура настроена, но **файлов с тестами пока нет**. Конфигурация:

**`vitest.config.js`:**
- Плагин `@storybook/addon-vitest` — превращает Storybook stories в тесты
- Браузерный провайдер: Playwright (Chromium, headless)
- Тестовый проект называется `"storybook"`

**Что уже готово:**
- Storybook stories для обоих компонентов полностью описывают все состояния
- При добавлении `@storybook/addon-vitest` можно запустить browser-тесты прямо на stories без написания отдельных тестовых файлов
- Playwright установлен и настроен

**Запуск тестов (когда будут добавлены):**
```bash
npx vitest
```

#### Accessibility (a11y)

Аддон `@storybook/addon-a11y` настроен в режиме `test: 'todo'` — показывает нарушения в UI Storybook, но не фейлит CI. Чтобы включить строгий режим, измените в `.storybook/preview.jsx`:
```js
a11y: { test: 'error' }
```

#### Визуальное тестирование (Chromatic)

При пуше в `main` GitHub Actions автоматически:
1. Собирает Storybook
2. Публикует в Chromatic с `autoAcceptChanges: true`

---

### CI/CD — Chromatic

**Файл:** `.github/workflows/chromatic.yml`

**Триггер:** push в ветку `main`

**Шаги:**
1. Checkout кода (`fetch-depth: 0` для полной истории)
2. Установка Node.js 22
3. `npm ci` — установка зависимостей
4. `npm run build-storybook` — сборка Storybook
5. Публикация в Chromatic через `chromaui/action@v1`

**Секреты:** токен `CHROMATIC_PROJECT_TOKEN` должен быть настроен в GitHub Secrets репозитория.

---

### TypeScript

**Конфигурация (`tsconfig.json`):**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

**Ключевые особенности:**
- `strict: true` — полная строгая типизация
- `noEmit: true` — сборка TS происходит через Vite (в составе Storybook), отдельной компиляции нет
- `moduleResolution: "bundler"` — современное разрешение модулей для Vite
- `jsx: "react-jsx"` — автоматический импорт React (не нужно писать `import React from 'react'` в каждом файле)

**Типы для CSS Modules** объявлены в `src/vite-env.d.ts`:
```ts
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

---

### Пакетный менеджер

Проект может использовать **npm** или **pnpm**. В наличии оба лок-файла (`package-lock.json` и `pnpm-lock.yaml`). Конфигурация `pnpm-workspace.yaml` содержит только:

```yaml
allowBuilds:
  esbuild: set this to true or false
```

**Рекомендуется использовать npm**, так как CI настроен на `npm ci`.

---

## Установка и запуск

### Требования

- **Node.js** ≥ 22
- **npm** ≥ 10 (или pnpm ≥ 9)

### Установка зависимостей

```bash
# Клонирование репозитория
git clone <repo-url>
cd ds

# Установка (npm)
npm install

# ИЛИ установка (pnpm)
pnpm install
```

### Основные команды

| Команда | Описание |
|---|---|
| `npm run build:tokens` | Сгенерировать CSS-переменные и TS-типы из `tokens/tokens.json` |
| `npm run storybook` | Запустить Storybook dev-сервер (порт 6006). **Автоматически запускает `build:tokens` перед стартом** |
| `npm run build-storybook` | Собрать статический Storybook в `storybook-static/`. Тоже запускает `build:tokens` |
| `npm run chromatic` | Опубликовать Storybook в Chromatic для визуального тестирования (требуется `CHROMATIC_PROJECT_TOKEN`) |
| `npx vitest` | Запустить тесты (когда будут добавлены) |

**Типичный цикл разработки:**

```bash
# 1. Запустить Storybook
npm run storybook

# 2. При изменении tokens.json — пересобрать токены
npm run build:tokens

# 3. Storybook подхватит изменения автоматически (HMR)
```

---

## Как добавить новый компонент

1. **Создать директорию** `src/components/ComponentName/`

2. **Создать файлы:**
   - `ComponentName.tsx` — компонент
   - `ComponentName.module.css` — стили
   - `ComponentName.stories.tsx` — Storybook-истории

3. **В компоненте** использовать CSS-переменные:
   ```css
   .myComponent {
     color: var(--ds-text-color);
     background: var(--ds-surface-neutral-light-color);
   }
   ```

4. **В stories** обязательно указать `tags: ['autodocs']` для автогенерации документации.

5. **Экспортировать** компонент и его типы в `src/index.ts`:
   ```ts
   export { ComponentName } from './components/ComponentName/ComponentName';
   export type { ComponentNameProps } from './components/ComponentName/ComponentName';
   ```

6. **При необходимости новых токенов:**
   - Добавить их в `tokens/tokens.json` (в соответствующий раздел: primitives или semantic)
   - Запустить `npm run build:tokens`
   - Новые CSS-переменные и TS-типы сгенерируются автоматически

---

## План развития

### Сделано
- [x] Дизайн-токен-пайплайн (Figma Tokens → Style Dictionary → CSS + TS)
- [x] Светлая и тёмная темы через `data-theme`
- [x] Компонент **Button** — 5 вариантов, 3 размера, иконки, все состояния
- [x] Компонент **Input** — 2 размера, лейбл, ошибка, clearable, доступность
- [x] Storybook 10 с автодокументацией
- [x] Интеграция с Chromatic (визуальное тестирование)
- [x] Тестовая инфраструктура (Vitest + Playwright + Storybook Test)
- [x] Настроен a11y-аддон
- [x] CI/CD: автопубликация в Chromatic при пуше в main

### TODO / В планах
- [ ] Экспортировать Input в `src/index.ts`
- [ ] Написать тесты (Vitest browser tests на основе stories)
- [ ] Настроить сборку npm-пакета (сейчас `noEmit: true`, нет конфига для дистрибуции)
- [ ] Добавить компоненты: Checkbox, Radio, Select, Textarea, Modal, Tooltip
- [ ] Доработать тёмную тему (семантические токены для dark пока частично совпадают с light)
- [ ] Настроить `CHROMATIC_PROJECT_TOKEN` в GitHub Secrets
- [ ] Настроить линтинг (ESLint)
- [ ] Настроить форматирование (Prettier)
- [ ] Добавить `CHANGELOG.md`

---

## Лицензия

ISC
