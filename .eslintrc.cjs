module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    "gbv",
    "gbv/vue/3",
  ],
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        "@babel/plugin-syntax-import-assertions",
      ],
    },
    ecmaVersion: 2020,
  },
  rules: {
    "vue/multi-word-component-names": "off",
  },
}
