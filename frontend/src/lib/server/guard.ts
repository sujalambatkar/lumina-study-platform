import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import { ApiError } from "./groq";

/** Best-effort per-instance rate limit; protects the shared API key from casual abuse. */
const hits = new Map<string, number[]>();
export function rateLimit(req: Request, max = 40, windowMs = 10 * 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) throw new ApiError(429, "Too many requests. Please wait a few minutes and try again.");
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
}

function isPrivate(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
}

/** Reject non-http(s) URLs and hosts that resolve to private networks (SSRF guard). */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try { url = new URL(raw); } catch { throw new ApiError(400, "That doesn't look like a valid URL."); }
  if (!/^https?:$/.test(url.protocol)) throw new ApiError(400, "Only http and https links are supported.");
  const addrs = await dns.lookup(url.hostname, { all: true }).catch(() => { throw new ApiError(400, "Couldn't find that website."); });
  if (addrs.some((a) => isPrivate(a.address))) throw new ApiError(400, "That address isn't allowed.");
  return url;
}

export function errorResponse(err: unknown): Response {
  if (err instanceof ApiError) return Response.json({ detail: err.message }, { status: err.status });
  console.error(err);
  return Response.json({ detail: "Something went wrong. Please try again." }, { status: 500 });
}
