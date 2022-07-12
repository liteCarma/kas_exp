import { got }  from 'got'
import { defaultHeaders } from './constants.js';

let req = got.extend({
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

if (process.env.NODE_ENV !== 'production') {
  const { HttpsProxyAgent } = await import('hpagent');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
  req = req.extend({
    https: {
      rejectUnauthorized: false
    },
    agent: {
      https: new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: 'http://127.0.0.1:8888'
      })
    },
  })
}

export default req


