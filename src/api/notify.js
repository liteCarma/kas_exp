import gotInstace from './requiest.js'
import appGlobal from '../appGlobal.js'

const { log } = appGlobal

const req = gotInstace.extend({
  retry: {
    limit: 5,
  },
  throwHttpErrors: false
})

export const notifyToTG = async (bot, text) => {
  const response = await req.post(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
    responseType: 'json',
    json: {
      chat_id: bot.chatId,
      text
    }
  })

  if (response.complete && response.body.ok) {
    log.info(`notification was sent successfully`)
  }

  if (response.error) {
    log.error(`error sending notification: ${response.error.message}`)
  } else if (!response.body.ok) {
    log.error(`error sending notification: ${response.body.description}, http_status: ${response.statusCode}`)
  }
}