/**
 * Validated environment variable accessors.
 *
 * These functions throw at call time if a required variable is missing,
 * producing a clear message rather than a cryptic Supabase client error.
 *
 * Call them inside functions (not at module top-level) so the error
 * surfaces at request time with a useful stack trace.
 */

export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(
      "[env] NEXT_PUBLIC_SUPABASE_URL is not set.\n" +
        "Add it to .env.local — find it in:\n" +
        "Supabase Dashboard → Project Settings → API → Project URL"
    );
  }
  return value;
}

export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(
      "[env] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.\n" +
        "Add it to .env.local — find it in:\n" +
        "Supabase Dashboard → Project Settings → API → anon / public key"
    );
  }
  return value;
}

