import { User } from '../models/user.js'
import { checkToken }  from '../api/api.js'

export const getStateConroller = async (req, res, next) => {
  const username = req.cookies.username
  const userState = { state: null }

  if (!username) {
    return res.json(userState)
  }
  
  try {
    const user = await User.getUser(username)
    if (user) {
      const isAuth = await checkToken(user.tokens.accessToken)
      userState.state = {
        isAuth: isAuth,
        dateRange: user.dateRange || [],
        catchedSlots: user.catchedSlots.slots,
        isWork: user.isWork
      }
    }
    res.json(userState)
  } catch(e) {
    next(e)
  }
}
