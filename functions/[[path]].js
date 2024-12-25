export async function onRequest({ request, next }) {
  // Forward all requests to the index.html file
  return next();
}
