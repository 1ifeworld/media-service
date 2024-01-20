export default defineEventHandler((event) => {
    if (getRequestURL(event).pathname.startsWith("/")) {
       if (event.node.req.method === "OPTIONS") {
          return null;
        }
    }
  });
