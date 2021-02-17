const lint = require("mocha-eslint")
const paths = [
  "**/*.js",
  "**/.*.js",
  "!node_modules/**/*.js",
  "!node_modules/**/.*.js",
  "!dist/**/*.js",
  "!dist/**/.*.js",
]
lint(paths, { contextName: "ESLint" })
