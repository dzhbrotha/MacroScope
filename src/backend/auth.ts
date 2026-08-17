import { supabase } from './supabaseClient'
import type { TranslationKey } from '../shared/i18n'

export function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signOut() {
  return supabase.auth.signOut()
}

// Maps a raw Supabase error onto a translation key so the message can be shown
// in the reader's language. Unknown errors fall through unchanged.
export function authErrorKey(message: string): TranslationKey | null {
  if (message === 'Failed to fetch' || message.includes('NetworkError')) return 'authErr.network'
  if (message.includes('Invalid login credentials')) return 'authErr.invalid'
  if (message.includes('User already registered')) return 'authErr.exists'
  if (message.includes('at least 6 characters')) return 'authErr.short'
  if (message.includes('valid email')) return 'authErr.email'
  if (message.includes('Email not confirmed')) return 'authErr.unconfirmed'
  return null
}
