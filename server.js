const express = require("express")
const app = express()
app.set("json spaces", 2)
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

const { decomposeDDC, build045H } = require("./lib")
const config = require("./config.js")
const { ddc } = config

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.render("base", config)
})

app.get("/decompose", async (req, res) => {
  const notations = req.query.notation.split("|")
  const format = req.query.format || "jskos"

  const result = []

  for (let notation of notations) {
    const concept = ddc.conceptFromNotation(notation, { inScheme: true })
    if (!concept) {
      continue
    }

    const memberList = await decomposeDDC(ddc, notation)
    if (memberList) {
      concept.memberList = memberList
    }

    if (format === "picajson") {
      const field = build045H(ddc, concept)
      result.push(field)
    } else if (format === "pp") {
      const field = build045H(ddc, concept)
      let pp = field.shift() + "/" + field.shift() + " "
      while (field.length) {
        pp += "$" + field.shift() + field.shift()
      }
      return res.send(pp)
    } else {
      result.push(concept)
    }
  }

  return res.send(result)
})

const { port } = config
app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
})
