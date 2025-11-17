// @ts-check

import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  ...next,
  {
    rules: {
      // TypeScript-specific rules - these will be handled by next/typescript
      // Import rules
      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "never", // Changed from "always" to reduce empty line errors
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          }
        }
      ],
    },
  },
  {
    files: ["**/*.stories.@(ts|tsx|js|jsx)"],
    rules: {
      // Storybook-specific rules
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]
  }
]);
