//https://nitro.unjs.io/config
export default defineNitroConfig({
  routeRules: {
    '/w3s': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'POST',
        'access-control-allow-origin': '*',
      },
    },
    '/mux/Upload': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'POST',
        'access-control-allow-origin': '*',
      },
    },
    '/mux/UploadStatus': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'POST',
        'access-control-allow-origin': '*',
      }
    }
  },
})
