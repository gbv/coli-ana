import gbv from "eslint-config-gbv"
import vue from "eslint-config-gbv/vue"

import babelParser from "@babel/eslint-parser"

export default [
  ...gbv,
  ...vue,
  {
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: [
            "@babel/plugin-syntax-import-assertions",
          ],
        },
        ecmaVersion: 2020,
      },
    },
  },
]
