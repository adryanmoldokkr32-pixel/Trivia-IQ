// =====================================================
// IQ-TRIVIA-RO / SUPABASE CLIENT (singleton, reutilizabil)
// Folosit din: auth.js, modes.js, game-logic.js, etc.
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ilowliyucohvqossxqbr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kuPZcP4ccCv7KTXVA0diYw_AfgO3Ssi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper: returnează user-ul curent (sau null)
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper: redirect la login dacă nu logat
export async function requireAuth(redirectUrl = '/auth.html?mode=login') {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectUrl;
    return null;
  }
  return user;
}
