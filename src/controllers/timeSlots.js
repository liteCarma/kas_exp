import { getTimeSlots, setTimeSlots, checkAndRefreshToken } from '../api/api.js'
import { RequestError } from 'got'
import { User } from '../models/user.js'
import { ApiError, ApiErrorInternalServerError } from '../api/errors.js'
import appGlobal from '../appGlobal.js'
import { notifyToTG } from '../api/notify.js'

const { log } = appGlobal

export const catchSlotsController = async (req, res, next) => {
  const username = req.cookies.username
  const { invoices = [], date, stop = false } = req.body 

  try {
    const user = await User.getUser(username)
    if (date) {
      await user.setDateTimeRange(date)
    }
  
    if (stop) {
      user.isWork = false
    } else if(!stop && !user.isWork) {
      user.isWork = true
      user.catchedSlots.slots = []
      setTimeout(async function retry(){
        if (invoices.length === 0) {
          user.isWork = false
          return
        }
    
        try {
          await setFreeSlot(user, invoices)
        } catch(error) {
          await timeSlotsErrorHandler(user, error)
        }
    
        if (user.isWork) {
          setTimeout(retry, 3000)
        }
      }, 0)
    }
  } catch(e) {
    next(e)
  }


  res.json({ success: true })
}

export const getCatchedSlotsController = async (req, res, next) => {
  const username = req.cookies.username

  try {
    const user = await User.getUser(username)
    const { catchedSlots } = user
  
    res.json({
      ...catchedSlots,
      isWork: user.isWork
    })
  
    catchedSlots.error = null
  } catch(e) {
    next(e)
  }
}


const setFreeSlot = async (user, invoices) => {
  const { tokens, dateRange } = user
  const minDate = new Date(user.dateRange[0]).getTime()
  const maxDate = new Date(user.dateRange[1]).getTime()
  const invoice = invoices[0]

  let freeSlots = await getTimeSlots(tokens.accessToken, user.shopId, invoice.id)
  freeSlots = freeSlots.filter(({timeFrom, timeTo}) => timeFrom >= minDate && timeTo <= maxDate)

  if (freeSlots.length === 0)  return 
  
  const { timeFrom } = freeSlots[0]

  const slot = await setTimeSlots(user.tokens.accessToken, user.shopId, {
    invoiceId: invoice.id,
    timeFrom
  })

  log.info(`received slots for invoice #${slot.invoiceNumber} on date ${new Date(slot.timeSlotReservation.timeFrom).toLocaleDateString()}`)
  user.catchedSlots.slots.push({
    invoiceNumber: invoice.invoiceNumber,
    date: timeFrom
  })
  invoices.splice(0, 1)

  if (process.env.TG_USERID && process.env.TG_TOKEN) {
    notifyToTG(
      {
        token: process.env.TG_TOKEN,
        chatId: process.env.TG_USERID
      },
      `получен слот для накладной №${slot.invoiceNumber} на дату ${new Date(slot.timeSlotReservation.timeFrom).toLocaleDateString()}`
    )
  }
}

const timeSlotsErrorHandler = async (user, error) => {
  if (error instanceof ApiErrorInternalServerError || error instanceof RequestError) {
    log.warn(error.message)
    return
  }

  if (error instanceof ApiError && error.message !== 'invalid_token') {
    user.isWork = false
    throw error
  }
  const result = await checkAndRefreshToken(user.tokens)

  if (result.refreshed) {
    await user.setTokens(result.tokens)
  }
}
