import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const cookieName = "distinct_leads_session";
const sessionLifetimeSeconds = 60 * 60 * 12;
// Cloudflare Workers currently caps PBKDF2 at 100,000 iterations.
const passwordIterations = 100_000;

export type DashboardUser = {
  id: number;
  username: string;
  displayName: string;
  sessionVersion: number;
};

async function requiredSecret(name: "LEADS_ACCESS_CODE" | "LEADS_SESSION_SECRET") {
  const { env } = await import("cloudflare:workers");
  const value = env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(await requiredSecret("LEADS_SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function sameValue(left: string, right: string) {
  const [leftDigest, rightDigest] = await Promise.all(
    [left, right].map(async (value) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))),
  );
  return equalBytes(leftDigest, rightDigest);
}

async function passwordDigest(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: passwordIterations, hash: "SHA-256" }, key, 256));
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validUsername(value: string) {
  const shortUsername = /^[a-z0-9][a-z0-9._-]{2,39}$/;
  const emailUsername = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return value.length <= 120 && (shortUsername.test(value) || emailUsername.test(value));
}

export function validPassword(value: string, username = "") {
  return value.length >= 14 && (!username || !value.toLowerCase().includes(username.toLowerCase()));
}

export async function createPasswordRecord(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await passwordDigest(password, salt);
  return { passwordSalt: base64Url(salt), passwordHash: base64Url(digest) };
}

export async function verifyPassword(password: string, passwordSalt: string, passwordHash: string) {
  try {
    const digest = await passwordDigest(password, fromBase64Url(passwordSalt));
    return equalBytes(digest, fromBase64Url(passwordHash));
  } catch {
    return false;
  }
}

async function dashboardSchema() {
  const [{ getDb }, { dashboardUsers }] = await Promise.all([import("../db"), import("../db/schema")]);
  return { db: getDb(), dashboardUsers };
}

export async function findDashboardUser(username: string) {
  const { db, dashboardUsers } = await dashboardSchema();
  const [user] = await db.select().from(dashboardUsers).where(eq(dashboardUsers.username, normalizeUsername(username))).limit(1);
  return user ?? null;
}

export async function dashboardUsersExist() {
  const { db, dashboardUsers } = await dashboardSchema();
  const [user] = await db.select({ id: dashboardUsers.id }).from(dashboardUsers).limit(1);
  return Boolean(user);
}

export async function isCorrectLeadPasscode(passcode: string) {
  return sameValue(passcode, await requiredSecret("LEADS_ACCESS_CODE"));
}

export async function createLeadSession(user: DashboardUser) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = `leads.${user.id}.${user.sessionVersion}.${expiresAt}`;
  return `${payload}.${base64Url(await hmac(payload))}`;
}

export async function getLeadSession(): Promise<DashboardUser | null> {
  const session = (await cookies()).get(cookieName)?.value;
  if (!session) return null;

  const [scope, idValue, versionValue, expiryValue, signature] = session.split(".");
  const id = Number(idValue);
  const sessionVersion = Number(versionValue);
  const expiresAt = Number(expiryValue);
  if (scope !== "leads" || !Number.isSafeInteger(id) || !Number.isSafeInteger(sessionVersion) || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) return null;
  try {
    if (!equalBytes(fromBase64Url(signature), await hmac(`${scope}.${idValue}.${versionValue}.${expiryValue}`))) return null;
  } catch {
    return null;
  }

  const { db, dashboardUsers } = await dashboardSchema();
  const [user] = await db.select({ id: dashboardUsers.id, username: dashboardUsers.username, displayName: dashboardUsers.displayName, sessionVersion: dashboardUsers.sessionVersion }).from(dashboardUsers).where(eq(dashboardUsers.id, id)).limit(1);
  if (!user || user.sessionVersion !== sessionVersion) return null;
  return user;
}

export async function hasLeadSession() {
  return Boolean(await getLeadSession());
}

export const leadSessionCookie = {
  name: cookieName,
  options: {
    httpOnly: true,
    maxAge: sessionLifetimeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
  },
};
