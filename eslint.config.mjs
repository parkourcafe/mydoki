// Конфиг ESLint (flat config, ESLint 9).
//
// Появился вместе с переходом на Next 16: там удалена команда `next lint`,
// а в package.json скрипт "lint" на неё ссылался, при этом конфига ESLint в
// репозитории не было вообще — то есть линт был объявлен, но не работал ни
// разу. Теперь `npm run lint` вызывает ESLint напрямую.
//
// eslint-config-next экспортирует уже готовые flat-массивы, поэтому FlatCompat
// не нужен: core-web-vitals включает правила next/ + react-hooks, typescript
// добавляет парсер и правила для .ts/.tsx.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    // Артефакты сборки и вендорные каталоги — линтить нечего и незачем.
    ignores: [
      ".next/**",
      "node_modules/**",
      "ios/**", // нативная обёртка Capacitor
      "public/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      // Кодовая база писалась без линта, поэтому часть правил включена как
      // warn, а не error: цель — не залить CI красным на легаси, а ловить
      // новое. Ужесточать по мере расчистки.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Правила React Compiler. Задача #13: 13 находок исправлены —
      // Date.now() в рендере заменён на состояние «сейчас» (окна Undo),
      // локаль/онлайн переведены на useSyncExternalStore, синхронные
      // setState-в-эффекте вынесены в микротаски или обработчики,
      // запись в ref в рендере перенесена в эффект. Правила возвращены
      // в error: регрессия теперь блокирует CI.
      "react-hooks/purity": "error",
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/refs": "error",
    },
  },
];

export default config;
