import "server-only";
import { MongoServerError } from "mongodb";
import { DatabaseNotConfiguredError } from "@/lib/db/mongodb";

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Rejects cross-site form posts: the browser's Origin must match the host it requested. Behind a reverse
 * proxy, request.url carries the app's internal address (e.g. localhost:3001), so compare against the Host
 * header the proxy forwards (nginx sets it to the public domain).
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Same-origin fetches from older browsers and server-side tools omit it.
  try {
    // Host only (not X-Forwarded-Host, which this proxy does not overwrite and a client could supply).
    const host = request.headers.get("host") || new URL(request.url).host;
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Maps storage failures to a safe response and logs the detail on the server. */
export function serverError(error: unknown, context: string) {
  if (error instanceof DatabaseNotConfiguredError) {
    console.error(`${context}: ${error.message}`);
    return json({ error: "Our service is not available right now. Please try again later." }, 503);
  }
  if (error instanceof MongoServerError && error.code === 11000) return json({ error: "This record already exists." }, 409);
  console.error(`${context} failed:`, error);
  return json({ error: "Something went wrong on our side. Please try again." }, 500);
}
