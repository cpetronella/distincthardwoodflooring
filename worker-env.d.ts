// Runtime secrets are configured independently of the public Wrangler config.
interface Env {
  LEADS_SESSION_SECRET?: string;
  LEADS_ACCESS_CODE?: string;
}
declare namespace Cloudflare {
  interface Env {
    LEADS_SESSION_SECRET?: string;
    LEADS_ACCESS_CODE?: string;
  }
}
