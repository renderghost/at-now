import type { Plugin } from 'vite';

/**
 * Serves api/now.ts at /api/now during `vite dev`, so the page works locally
 * without the Vercel CLI. Production uses the Vercel function directly.
 */
export default function devApi(): Plugin {
  return {
    name: 'now-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/now', async (req, res, next) => {
        try {
          const mod = (await server.ssrLoadModule('/api/now.ts')) as {
            GET: (request: Request) => Promise<Response>;
          };
          const response = await mod.GET(
            new Request(`http://localhost${req.originalUrl ?? '/api/now'}`)
          );
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
