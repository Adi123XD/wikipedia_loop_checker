import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { checkLoop } from './utility.js';
const app = express()
app.use(cors())
const port = process.env.PORT || 3000
const url = process.env.URL
console.log(url)
app.get("/", async (req, res) => {
    try {
        const url = req.query.url
        const { pathArr, count } = await checkLoop(url)
        return res.status(200).json({ pathArr, count })
    } catch (error) {
        return res.status(500).json({"message":error.message})
    }
})
app.listen(port, () => {
    console.log(`The server is listening on http://localhost:${port}`)
})