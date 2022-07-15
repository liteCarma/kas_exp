import gotInstace from './requiest.js'
import { ApiError , ApiErrorInternalServerError } from './errors.js'
import { defaultHeaders } from './constants.js';

const req = gotInstace.extend({
  prefixUrl: 'https://api.business.kazanexpress.ru/api',
  responseType: 'json',
  headers: {
   ...defaultHeaders
  },
  retry: {
    limit: 5,
  },
  hooks: {
    beforeError: [
      error => {
				const {response} = error;
				if (response && response.body && response.body.errors) {
					error.message = response.body.errors[0].message
				}

				return error;
			}
    ]
  },
  timeout: { request: 60000 },
  throwHttpErrors: true,
})

export const signIn = async (username, password) => {
  const response = await req.post('oauth/token', {
    headers: {
      'Authorization': 'Basic a2F6YW5leHByZXNzOnNlY3JldEtleQ==',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeURI(`grant_type=password&username=${username}&password=${password}`)
  })

  throwErrorIfHasErrors(response)
  return response.body
}


export const refreshToken = async (refreshToken) => {
  const response = await req.post('oauth/token', {
    headers: {
      'Authorization': 'Basic a2F6YW5leHByZXNzOnNlY3JldEtleQ==',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodeURI(`grant_type=refresh_token&refresh_token=${refreshToken}`)
  })

  throwErrorIfHasErrors(response)
  return response.body
}

export const checkToken = async (accessToken) => {
  let active = false
  try {
    const response = await req.post('auth/seller/check_token', {
      headers: {
        'Authorization': 'Basic a2F6YW5leHByZXNzOnNlY3JldEtleQ==',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encodeURI(`token=${accessToken}`)
    })
  
    throwErrorIfHasErrors(response)
    active = response.body.active 
  } catch {}

  return active 
}

export const checkAndRefreshToken = async (tokens) => {
  let isActiveToken = false
  let actualTokens = {
    tokens: {...tokens},
    refreshed: false
  }
  const dateTokenExpiration = new Date(parseInt(tokens.tokenDateCreated, 10))
  dateTokenExpiration.setDate(dateTokenExpiration.getDate() + 1)


  if (new Date() < dateTokenExpiration) {
    isActiveToken = await checkToken(tokens.accessToken)
  }

  if (!isActiveToken) {
    const result = await refreshToken(tokens.refreshToken)
    actualTokens.tokens = result
    actualTokens.refreshed = true
  }

  return actualTokens
}

export const getShopId =  async (accessToken) => {
  const response = await req.get('seller/shop/ ', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  throwErrorIfHasErrors(response)

  return response.body[0].id
}

export const getCreatedInvoices = async (accessToken, shopId) => {
  let page = 0
  let invoices = []
  let end = false

  while(!end) {
    const response = await req.get(`seller/shop/${shopId}/invoice?page=${page++}&size=20`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    throwErrorIfHasErrors(response)

    const createdInvoices = response.body.filter(i => i.invoiceStatus.value === 'CREATED' && !i.timeSlotReservation)
    invoices.push(...createdInvoices)
    end = createdInvoices.length === 0
  }
  return invoices
}

export const getTimeSlots = async (accessToken, shopId, invoice) => {
  const timeFrom = new Date()
  timeFrom.setDate(timeFrom.getDate() + 1)
  const response = await req.post(`seller/shop/${shopId}/v2/invoice/time-slot/get`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    json: {"invoiceIds": [invoice],"timeFrom": timeFrom.getTime()}
  })

  throwErrorIfHasErrors(response)

  return response.body.payload.timeSlots
}


export const setTimeSlots = async (accessToken, shopId, slot) => {
  const { invoiceId, timeFrom } = slot
  
  const response = await req.post(`seller/shop/${shopId}/v2/invoice/time-slot/set`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    json: {"invoiceIds": [invoiceId],"timeFrom": timeFrom}
  })

  throwErrorIfHasErrors(response)

  return response.body.payload[0]
}

const hasErros = ({ statusCode, body }) => statusCode !== 200 || body.error

const parseError = (body) => {
  let error = Array.isArray(body.errors) ? body.errors[0] : body.error
  let errorMsg = 'Unknown error'
  if (error) {
    errorMsg = error.message ? error.message : error
  } 
  return errorMsg
}

const throwErrorIfHasErrors = (response) => {
  if (hasErros(response)) {
    const errorMsg = parseError(response.body)

    switch (errorMsg) {
      case('Internal server error'): {
        throw new  ApiErrorInternalServerError(errorMsg)
      }
      default: {
        throw new ApiError(errorMsg)
      }
    }
  }
} 