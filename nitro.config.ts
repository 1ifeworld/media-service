//https://nitro.unjs.io/config
export default defineNitroConfig({
  routeRules: {
    '/': {
      cors: true,
    },
    '/w3s': {
      headers: {
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': '*',
        'access-control-allow-origin': '*',
      },
    },
  },
})
