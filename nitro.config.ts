//https://nitro.unjs.io/config
export default defineNitroConfig({
  routeRules: {
    '/': {
      cors: true,
    },
    '/w3s': {
      headers: {
        'access-control-allow-methods': 'POST',
        'access-control-allow-origin': '*',
      },
    },
    '/mux/**': {
      headers: {
        'access-control-allow-methods': 'POST',
        'access-control-allow-origin': '*',
      },
    },
  },
})
