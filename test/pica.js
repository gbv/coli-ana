import { expect } from "chai"
import { picaFromDDC, serializePicaField } from "../lib/pica.js"

import { createRequire } from "module"
const require = createRequire(import.meta.url)
const tests = require("./pica-tests.json")

describe("serializePicaField", () => {
  tests.forEach(({notation, memberList, pica}) => {
    it(`${notation}`, () => {
      const field = picaFromDDC({ notation, memberList })[0]
      expect(serializePicaField(field)).equal(pica)
    })
  })
})
