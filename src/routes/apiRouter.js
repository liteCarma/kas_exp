import express from 'express'
import { getStateConroller  } from '../controllers/state.js'
import { signInConroller } from '../controllers/signin.js'
import { getInvoicesController } from '../controllers/invoices.js'
import { catchSlotsController, getCatchedSlotsController } from '../controllers//timeSlots.js'

export const apiRouter = express.Router()

apiRouter.post('/signin', signInConroller)

apiRouter.get('/state', getStateConroller)

apiRouter.get('/invoices', getInvoicesController)

apiRouter.get('/catchslots', getCatchedSlotsController)
apiRouter.post('/catchslots', catchSlotsController)
