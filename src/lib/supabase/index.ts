// Supabase configuration + the admin (service-role) client.
//
// Three client flavors live in this folder, kept separate so we never leak
// the service-role key to the browser:
//   - index.ts  -> getAdminSupabase(): service-role, server-only, bypasses RLS
//   - server.ts -> createServerSupabase(): user session via cookies (SSR)
//   - client.ts -> createBrowserSupabase(): browser, user session

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const COUNCIL_TABLE = "council_sessions";

/** True when the public (browser) Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** True when server-side persistence (service role) is available. */
export function isServerSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Server-only client using the service-role key. Bypasses RLS, so use it only
 * for trusted server writes (inserts that stamp a verified user_id). Never
 * import this into client components.
 */
export function getAdminSupabase(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      "Server Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
