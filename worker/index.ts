/** Cloudflare Worker entry point for the vinext-starter template. */
import handler from "vinext/server/app-router-entry";
import { mutationAllowed } from "../lib/request-security";
import { cleanupExpired } from "../lib/retention";

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (!["GET","HEAD","OPTIONS"].includes(request.method) && !mutationAllowed(request)) return new Response("Request rejected", {status:403});
    if (url.pathname.startsWith('/api/') && Number(request.headers.get('content-length') || 0)>16000) return new Response("Request too large", {status:413});
    if (env.DB && url.pathname === "/" && request.method === "GET") ctx.waitUntil(cleanupExpired(env.DB).catch(() => { console.error("Retention cleanup failed"); }));

    const result = await handler.fetch(request, env, ctx);
    const response = new Response(result.body,result);
    response.headers.set('X-Content-Type-Options','nosniff');
    response.headers.set('Referrer-Policy','no-referrer');
    response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    response.headers.set('Content-Security-Policy',"object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
    if (url.pathname.startsWith('/leads') || url.pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control','private, no-store, max-age=0');
      response.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
    }
    if (url.hostname.endsWith(".workers.dev")) response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  },
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) { ctx.waitUntil(cleanupExpired(env.DB)); },
};

export default worker;
