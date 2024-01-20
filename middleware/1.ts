export default defineEventHandler((event) => {
    if (getRequestURL(event).pathname.startsWith("/" || "/mux/")) {
       if (event.node.req.method === "OPTIONS") {
          return null;
        }
    }
  });
