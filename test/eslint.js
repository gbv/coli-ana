const lint = require("mocha-eslint")
const paths = [
  "**/*.js",
  "!node_modules/**/*.js"
]
lint(paths, { contextName: "ESLint" })
