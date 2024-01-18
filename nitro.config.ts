//https://nitro.unjs.io/config
export default defineNitroConfig({
  routeRules: {
    '/w3s': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-origin': '*',
        'access-control-allow-headers': '*'
      },
    },
    '/mux/upload': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'OPTIONS, POST',
        'access-control-allow-origin': '*',
        'access-control-allow-headers': '*'
      },
    },
    '/mux/uploadStatus': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'OPTIONS, POST',
        'access-control-allow-origin': '*',
        'access-control-allow-headers': '*'
      },
    },
  },
  storage: {
    'redis': {
      driver: 'redis',
      url: process.env.REDIS_URL,
    },
},
}
)
