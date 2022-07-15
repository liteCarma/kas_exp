import appGlobal from '../appGlobal.js'
const { prisma, users } = appGlobal

export const User = class User {
  constructor (username, tokens) {
    this.username = normalizeUserName(username)
    this.isAuth = false
    this.isWork = false
    this.catchedSlots = {
      slots: [],
      error: null
    }
    this.tokens = null
    this.dateRange = null
    this.shopId = null
    users.set(username, this)
  }

  static async getUser(username) {
    if (!username) return null

    username = normalizeUserName(username)
    if (users.has(username)) {
      return users.get(username)
    }

    const userDataFromBD = await prisma.user.findFirst({
      where: { username: username }
    })

    if (!userDataFromBD) {
      return null
    }

    const user = new User(username)
    user.tokens = {
      tokenDateCreated: userDataFromBD.tokenDateCreated,
      accessToken: userDataFromBD.accessToken,
      refreshToken: userDataFromBD.refreshToken
    }
    user.dateRange = userDataFromBD.dateRange ? userDataFromBD.dateRange.split('-') : null
    user.shopId = userDataFromBD.shopId
    return users.get(username)
  }


  async setTokens(tokens) {
    this.tokens = {
      tokenDateCreated: Date.now(),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
    return await prisma.user.update({
      where: { username: this.username },
      data: this.tokens
    })
  }

  async setShopId(shopId) {
    this.shopId = shopId
    return await prisma.user.update({
      where: { username: this.username },
      data: { shopId }
    })
  }

  async setDateTimeRange(dateRange) {
    this.dateRange = dateRange

    return await prisma.user.update({
      where: { username: this.username },
      data: { 
        dateRange: dateRange.join('-')
      }
    })
  }

  async save() {
    return await prisma.user.create({
      data: {
        username: this.username,
        ...this.tokens
      }
    })
  }
}

function normalizeUserName(username) {
  const isEmail = username.includes('@')
  if (!isEmail) {
   username = username.replace(/[^\d]/g, '')
  }
  return username
}