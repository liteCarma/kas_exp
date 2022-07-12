import { getCreatedInvoices, checkAndRefreshToken, getShopId } from '../api/api.js'
import { User } from '../models/user.js'

export const getInvoicesController = async (req, res, next) => {
  const username = req.cookies.username

  try {
    const user = await User.getUser(username)
    const { tokens } = user

    const result = await checkAndRefreshToken(tokens)
  
    if (result.refreshed) {
      await user.setTokens(result.tokens)
    }

    if (!user.shopId) {
      const shopId = await getShopId(user.tokens.accessToken)
      await user.setShopId(shopId)
    }
  
    const invoices = await getCreatedInvoices(user.tokens.accessToken, user.shopId)

    res.json(invoices)
  } catch(e) {
    next(e)
  }
}
