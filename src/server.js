import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import appGlobal from './appGlobal.js'
import { apiRouter } from './routes/apiRouter.js'
import { errorHandler } from './middlewares/errors.js'
import * as dotenv from 'dotenv'
import { notifyToTG } from './api/notify.js'

dotenv.config()

const { log, cfg } = appGlobal
const app = express();


app.use(express.static(path.resolve('./public'), { index: false }))
app.use(express.json())
app.use(cookieParser())

app.get(`/${cfg.secretPath}`, (req, res) => {
  res.sendFile(path.resolve('./index.html'))
})
app.use('/api', apiRouter)


app.use(errorHandler);


const host = process.env.HOST || cfg.host
const port = process.env.PORT || cfg.port

app.listen(port, host, () => {
  const text = `server is runing, local url: http://localhost:${port}/${cfg.secretPath}`
  log.info(text)

  if (process.env.TG_USERID && process.env.TG_TOKEN) {
    notifyToTG({
      token: process.env.TG_TOKEN,
      chatId: process.env.TG_USERID
    },
    text
    )
  }
})
