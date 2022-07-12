import { signIn } from '../api/api.js'
import { User } from '../models/user.js'

export const signInConroller = async (req, res, next) => {
  const { username, password } = req.body
  
  const result = { error: null, success: false}

  
  try {
    let user = await User.getUser(username)
    if (!user) {
      user = new User(username)
      await user.save()
    }

    if (!user.isAuth) {
      const tokens = await signIn(user.username, password)
      user.isAuth = true
      await user.setTokens(tokens)
    }

    res.cookie('username', user.username)
    res.json({ success: true })
  } catch(e) {
    next(e)
  }
}