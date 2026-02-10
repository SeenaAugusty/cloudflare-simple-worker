/**
 * Cloudflare Worker for Log Collection
 *
 * This worker captures HTTP request/response data and forwards it to the log collection API.
 * It runs as a middleware, meaning it doesn't interfere with the actual request handling of the website.
 */

export interface Env {
  INGESTION_ENDPOINT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Force Worker to always run, bypass cache completely
    const cacheBypass: RequestInit = {
      cf: {
        cacheEverything: false,
        cacheTtl: 0,
        bypassCache: true
      }
    } as RequestInit;

    // Get the original response (with cache bypass)
    const response = await fetch(request, cacheBypass);

    // Clone the response so we can read it multiple times
    const responseClone = response.clone();

    ctx.waitUntil(handleRequest(request, responseClone, env));
    return response;
  }
};

async function handleRequest(request: Request, response: Response, env: Env) {
  const url = new URL(request.url);
  const cf = (request as any).cf || {};

  const log = {
    EdgeStartTimestamp: new Date().toISOString(),
    ClientIP: request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "",
    ClientCountry: cf.country || "",
    ClientCity: cf.city || "",
    ClientRequestScheme: url.protocol.replace(":", ""),
    ClientRequestHost: request.headers.get("host") || url.host,
    ClientRequestURI: url.pathname + (url.search || ""),
    ClientRequestMethod: request.method,
    ClientRequestUserAgent: request.headers.get("user-agent") || "",
    ClientRequestReferer: request.headers.get("referer") || "",
    EdgeResponseStatus: response.status
  };

  await fetch(env.INGESTION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([log])
  }).catch(error => console.error('Failed to send logs:', error));
}