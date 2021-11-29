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
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "vue/multi-word-component-names": "off",
  },
}
