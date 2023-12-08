import path from "path"
import express from "express"
import config from "./config/index.js"
import compression from "compression"
import serveStatic from "serve-static"
import { decomposeDDC } from "./lib/index.js"
import isMemberParentOf from "./lib/isMemberParentOf.js"
import { serializePica, picaFromDDC, pica3FromDDC } from "./lib/pica.js"
import { cleanupNotation } from "./lib/baseNumber.js"

const { ddc } = config

// __dirname is not defined in ES6 modules (https://techsparx.com/nodejs/esnext/dirname-es-modules.html)
const __dirname = path.dirname(new URL(import.meta.url).pathname)

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
) {
  const resolve = (p) => path.resolve(__dirname, p)

  const app = express()
  app.set("json spaces", 2)

  app.use((req, res, next) => {
    if (req.headers.origin) {
      // Allow all origins by returning the request origin in the header
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    } else {
      // Fallback to * if there is no origin in header
      res.setHeader("Access-Control-Allow-Origin", "*")
    }
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.setHeader("Access-Control-Allow-Methods", "GET")
    res.setHeader("Access-Control-Expose-Headers", "X-Total-Count, Link", "coli-ana-backend")
    next()
  })

  /**
   * /analyze API route
   */
  app.get("/analyze", async (req, res, next) => {
    const notation = cleanupNotation(req.query.notation)
    const format = req.query.format || "jskos"
    const complete = req.query.complete && req.query.complete !== "0" && req.query.complete !== "false"
    const atomic = req.query.atomic && req.query.atomic !== "0" && req.query.atomic !== "false"

    req.query.limit = parseInt(req.query.limit) || 10
    req.query.offset = parseInt(req.query.offset) || 0

    let result = []

    try {
      // Analyze notation
      if (notation) {
        const concept = ddc.conceptFromNotation(notation, { inScheme: true })
        if (concept) {
          concept.memberList = await decomposeDDC(ddc, notation)
          result.push(concept)

          // Set backend header
          if (concept.memberList._backend) {
            res.setHeader("coli-ana-backend", concept.memberList._backend)
            delete concept.memberList._backend
          }
        }
      }
      if (result.totalCount !== undefined) {
        res.set("X-Total-Count", result.totalCount)
      }
      // Adjust result
      result = result.map(concept => {
        const memberList = concept.memberList
        if (memberList) {
          // Check if it's necessary to swap some lines
          // TODO: Verify and test this check.
          for (let i = 1; i < memberList.length; i += 1) {
            if (!memberList[i] || !memberList[i - 1]) {
              continue
            }
            if (memberList[i].notation[1] === memberList[i - 1].notation[1] && memberList[i].notation[0].length > memberList[i - 1].notation[0].length) {
              [memberList[i], memberList[i - 1]] = [memberList[i - 1], memberList[i]]
            }
          }
          const missingMemberPositions = []
          for (let i = 1; i < memberList.length; i += 1) {
            // Add broader fields to members
            const member1 = memberList[i - 1]
            const member2 = memberList[i]
            if (!member1 || !member2) {
              continue
            }
            if (isMemberParentOf(member1, member2)) {
              member2.broader = [{ uri: member1.uri }]
            } else {
              // Check if a member is missing
              const notation2 = member2.notation[1]
              let index2 = notation2.search(/[^-.]/) - 1
              if (index2 < 1) {
                continue
              }
              if (notation2[index2] === ".") {
                index2 -= 1
              }
              const notation1 = member1.notation[1]
              let index1 = notation1.search(/[^-.]/) - 1
              if (notation1[index1] === ".") {
                index1 -= 1
              }
              if (index1 < index2 && notation1[index2] === "-") {
                missingMemberPositions.push(i + missingMemberPositions.length)
              }
            }
          }
          missingMemberPositions.forEach(index => memberList.splice(index, 0, null))
          // Check if analysis is incomplete and add `null` to the end of the list
          const last = memberList[memberList.length - 1]
          if (last && last.notation[1].endsWith("-")) {
            memberList.push(null)
          }
          concept.memberList = memberList
        }
        return concept
      })
    } catch (error) {
      next(error)
      return
    }

    if (complete) {
      // filter out incomplete results and empty member lists
      result = result.filter(({memberList}) => !memberList.includes(null))
    }

    if (format === "picajson") {      // DEPRECATED!
      result = [].concat.apply([],result.map(picaFromDDC)) // merge into one record
    } else if (format === "pp") {     // DEPRECATED!
      result = result.map(concept => serializePica(picaFromDDC(concept))).join("\n")
    } else if (format === "pica3") {  // DEPRECATED!
      result = result.map(pica3FromDDC).join("\n")
    } else {
      result.forEach(concept => {
        if (atomic) {
          concept.memberList = concept.memberList.filter(member => member.ATOMIC)
        }
      })
    }

    return res.send(result)
  })

  /**
   * /status API route
   */
  app.get("/status", async (req, res) => {
    // TODO: Remove code duplication.
    const result = {
      backend: {
        ok: 0,
      },
    }
    const testNotation = "700.23"
    const testNotationMemberUris = [
      "http://dewey.info/class/7/e23/",
      "http://dewey.info/class/70/e23/",
      "http://dewey.info/class/700/e23/",
      "http://dewey.info/class/700.1-700.9/e23/",
      "http://dewey.info/class/700.2/e23/",
      "http://dewey.info/facet/0",
      "http://dewey.info/class/1--0/e23/",
      "http://dewey.info/class/1--02/e23/",
      "http://dewey.info/class/1--023/e23/",
    ]
    const checkMemberList = (memberList) => {
      return JSON.stringify(testNotationMemberUris) !== JSON.stringify((memberList || []).map(m => m && m.uri))
    }
    // 1. Try backend
    if (!config.backend) {
      result.backend.message = "Backend is not configured."
    } else {
      try {
        const memberList = await decomposeDDC(ddc, testNotation)
        if (memberList._backend !== "vc_day_srv") {
          result.backend.message = `No result from backend for example notation ${testNotation}.`
        } else {
          // Compare member URIs via JSON.stringify
          if (checkMemberList(memberList)) {
            result.backend.message = `Invalid result from backend for example notation ${testNotation}.`
          } else {
            result.backend.ok = 1
          }
        }
      } catch (error) {
        // This means that the database was used as a fallback => no result from backend
        // TODO: We should add proper errors in decomposeDDC
        result.backend.message = `No result from backend for example notation ${testNotation}.`
      }
    }
    return res.send(result)
  })

  // Redirect old URLs (#16)
  app.get(new RegExp(`^/(${ddc.notationPattern})$`), (req, res) => {
    res.redirect(`${config.base}?notation=${req.params[0]}`)
  })

  /**
   * Vite middleware
   */
  let vite
  if (!isProd) {
    vite = await (await import("vite")).createServer({
      root,
      logLevel: config.isTest ? "error" : "info",
      server: {
        middlewareMode: true,
      },
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(compression())
    app.use(
      serveStatic(resolve("dist")),
    )
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.code || 500).send(err.message || "Something went wrong.")
  })

  return { app, vite }
}

if (!config.isTest) {
  createServer().then(({ app }) =>
    app.listen(config.port, () => {
      config.info(`Now listening on port ${config.port}`)
    }),
  )
}
