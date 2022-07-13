import { got }  from 'got'

let gotInstace = got

if (process.env.NODE_ENV !== 'production') {
  const { HttpsProxyAgent } = await import('hpagent');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
  gotInstace = gotInstace.extend({
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

export default gotInstace


