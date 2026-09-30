export function mutationAllowed(request: Request) {
  const origin = request.headers.get("origin");
  return (!origin || origin === new URL(request.url).origin) && request.headers.get("sec-fetch-site") !== "cross-site";
}
export async function smallJson(request: Request): Promise<Record<string, unknown>> {
  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) throw new Error("JSON required");
  const body = await request.text();
  if (body.length > 16000) throw new Error("Request too large");
  const data = JSON.parse(body);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid body");
  return data;
}
