import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const runtimeEnv = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const runtimeContext = {
  waitUntil() {},
  passThroughOnException() {},
};

test("renders development preview metadata", async () => {
  const worker = await loadWorker();

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    runtimeEnv,
    runtimeContext,
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders separate optional email and text marketing permissions", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), runtimeEnv, runtimeContext);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /name=["']emailMarketingConsent["']/i);
  assert.match(html, /name=["']phoneMarketingConsent["']/i);
  assert.doesNotMatch(html, /<input(?=[^>]*name=["'](?:emailMarketingConsent|phoneMarketingConsent)["'])[^>]*\bchecked\b/i);
  assert.match(html, /Your choices will not affect your estimate request or your ability to purchase services/i);
  assert.match(html, /electronically sign/i);
  assert.match(html, /Reply STOP to opt out or HELP for help/i);
  assert.match(html, /Marketing Communications Terms/i);
  assert.match(html, /at least 18 years old/i);
});

test("customer landing page routes visitors to the estimate form", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), runtimeEnv, runtimeContext);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Request my free estimate/i);
  assert.doesNotMatch(html, /tel:\+?19178870192/i);
  assert.doesNotMatch(html, /Call \(917\) 887-0192/i);
});

test("privacy notice explains marketing choices and opt out", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/privacy", { headers: { accept: "text/html" } }), runtimeEnv, runtimeContext);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Marketing permission is optional/i);
  assert.match(html, /replying STOP/i);
  assert.match(html, /does not sell or rent/i);
  assert.match(html, /limited suppression record/i);
});

test("marketing communications terms disclose email, text, opt-out, and no-sale practices", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/terms", { headers: { accept: "text/html" } }), runtimeEnv, runtimeContext);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Email marketing/i);
  assert.match(html, /prior express written consent/i);
  assert.match(html, /not required as a condition/i);
  assert.match(html, /Message frequency varies/i);
  assert.match(html, /Message and data rates may apply/i);
  assert.match(html, /Reply.*STOP.*opt out/is);
  assert.match(html, /Reply.*HELP.*assistance/is);
  assert.match(html, /does not sell or rent/i);
  assert.match(html, /No subscription or automatic renewal/i);
  assert.match(html, /Privacy Notice/i);
});

test("dashboard sign-in uses individual account credentials and offers private setup", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/leads/sign-in", { headers: { accept: "text/html" } }), runtimeEnv, runtimeContext);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /name=["']username["']/i);
  assert.match(html, /name=["']password["']/i);
  assert.match(html, /First time\? Set up the two dashboard accounts/i);
  assert.match(html, /Distinct Hardwood Flooring/i);
});

test("sign out returns the owner to sign in", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("http://localhost/api/leads/logout", { method: "POST" }), runtimeEnv, runtimeContext);

  assert.equal(response.status, 303);
  assert.equal(new URL(response.headers.get("location")).pathname, "/leads/sign-in");
});
