const express = require("express")
const app = express()
app.set("json spaces", 2)
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

config = require("./config.js")
const { ddc } = config 

const { decomposeDDC, build045H } = require("./lib")

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.render("base", config)
})

app.get("/:notation", async (req, res) => {
  const { notation } = req.params
  const format = req.query.format || "jskos"

  const concept = ddc.conceptFromNotation(notation, { inScheme: true })
  if (!concept) {
    return res.send([])
  }

  const memberList = await decomposeDDC(ddc, notation)
  if (memberList) {
    concept.memberList = memberList
  }

  if (format === "picajson") {
    const field = build045H(ddc, concept)
    return res.send([field])
  } else if (format === "pp") {
    const field = build045H(ddc, concept)
    let pp = field.shift() + "/" + field.shift() + " "
    while (field.length) {
      pp += "$" + field.shift() + field.shift()
    }
    return res.send(pp)
  }

  return res.send([concept])
})

const { port } = config
app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
})
