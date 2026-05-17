import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi", "node_modules", ".tanstack"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // ── Strict TypeScript Rules (Issue #7) ──────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // ── No console.log in production (Issue #7) ─────────────────────────
      "no-console": ["error", { allow: ["warn", "error"] }],

      // ── Banned imports (Issue #7, #31, #35) ──────────────────────────────
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package.",
            },
            {
              name: "next/server",
              message: "This project uses TanStack Start, not Next.js. See ADR-0001.",
            },
            {
              name: "next/headers",
              message: "This project uses TanStack Start, not Next.js. See ADR-0001.",
            },
          ],
          patterns: [
            {
              group: ["openai", "openai/*"],
              message: "Use @zenith/ai gateway only. Direct OpenAI imports are banned.",
            },
            {
              group: ["@anthropic-ai/sdk", "@anthropic-ai/sdk/*"],
              message: "Use @zenith/ai gateway only. Direct Anthropic imports are banned.",
            },
          ],
        },
      ],

      // ── React ───────────────────────────────────────────────────────────
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  eslintPluginPrettier,
);
