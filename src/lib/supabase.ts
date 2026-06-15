// Supabase clients. Two factories so we never leak the service-role key
// to the browser:
//   - getBrowserSupabase(): anon key, safe for client components.
//   - getServerSupabase():  service-role key, server-only (API routes).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const COUNCIL_TABLE = "council_sessions";

let browserClient: SupabaseClient | null = null;

/** Browser-safe client (anon key). Used by client components for reads. */
export function getBrowserSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return browserClient;
}

/**
 * Server-only client using the service-role key. Use exclusively in
 * server code (route handlers, server components) — never in the browser.
 */
export function getServerSupabase(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      "Server Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}

/** True when the public (browser) Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
