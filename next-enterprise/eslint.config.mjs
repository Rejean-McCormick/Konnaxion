import * as fs from "fs";

// import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";  // optional
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginNext from "@next/eslint-plugin-next";
import eslintPluginStorybook from "eslint-plugin-storybook";
import typescriptEslint from "typescript-eslint";

const eslintIgnore = [
  ".git/",
  ".next/",
  "node_modules/",
  "dist/",
  "build/",
  "coverage/",
  "*.min.js",
  "*.config.js",
  "*.d.ts",
];

const config = typescriptEslint.config(
  // ➊ baseline
  { ignores: eslintIgnore },

  // ➋ add Storybook rules
  ...eslintPluginStorybook.configs["flat/recommended"],

  // ➌ base TS rules
  typescriptEslint.configs.recommended,

  // ➍ import-plugin recommended
  eslintPluginImport.flatConfigs.recommended,

  // ➎ Next.js plugin
  {
    plugins: {
      "@next/next": eslintPluginNext,
    },
    rules: {
      ...eslintPluginNext.configs.recommended.rules,
      ...eslintPluginNext.configs["core-web-vitals"].rules,
    },
  },

  // ➏ **our project-specific settings & rules**
  {
    settings: {
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl", "cn", "cva"],
      },
      "import/resolver": {
        /* ---- make eslint-plugin-import understand TS aliases ---- */
        typescript: {
          project: ["./tsconfig.json"], // array form is preferred
          alwaysTryTypes: true,
        },
        /* --------------------------------------------------------- */
        node: {
          moduleDirectory: ["node_modules", "./"],
        },
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "sort-imports": [
        "error",
        { ignoreCase: true, ignoreDeclarationSort: true },
      ],

      /* group & alphabetise imports; include @/modules alias */
      "import/order": [
        "warn",
        {
          groups: ["external", "builtin", "internal", "sibling", "parent", "index"],
          pathGroups: [
            ...getDirectoriesToSort().map((d) => ({
              pattern: `${d}/**`,
              group: "internal",
            })),
            { pattern: "env", group: "internal" },
            { pattern: "theme", group: "internal" },
            { pattern: "public/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["internal"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
);

/* -------- helper ------------------------------------------------ */
function getDirectoriesToSort() {
  const ignored = [".git", ".next", ".vscode", "node_modules"];
  return fs
    .readdirSync(process.cwd())
    .filter((f) => fs.statSync(`${process.cwd()}/${f}`).isDirectory())
    .filter((f) => !ignored.includes(f));
}

export default config;
