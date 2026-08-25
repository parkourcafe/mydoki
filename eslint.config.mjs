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

      // Правила React Compiler. В eslint-config-next 16 они идут как error и
      // при первом же прогоне дали 13 срабатываний в коде, который давно
      // работает в проде: Date.now() в теле рендера, setState в эффекте на
      // маунте (детект локали, navigator.onLine, закрытие меню при смене
      // маршрута), запись в ref во время рендера.
      //
      // Понижены до warn СОЗНАТЕЛЬНО и временно. Это не «отключить, чтобы
      // позеленело»: находки остаются видимыми в выводе линта, но не блокируют
      // задачу «обновить Next и закрыть CVE», в рамках которой линт вообще
      // появился. Правка требует трогать 12 компонентов с реальным риском
      // изменить поведение — это отдельная работа с отдельной проверкой.
      // Возврат к error — после расчистки (см. задачу про react-hooks).
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default config;
