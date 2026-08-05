import { supabase } from './supabaseClient'

export function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function friendlyAuthError(message: string): string {
  if (message === 'Failed to fetch' || message.includes('NetworkError')) {
    return 'Cannot reach Supabase. Check your internet connection and confirm the Supabase project is active.'
  }
  if (message.includes('Invalid login credentials')) return 'Incorrect email or password'
  if (message.includes('User already registered')) return 'An account with this email already exists'
  if (message.includes('at least 6 characters')) return 'Password must be at least 6 characters'
  if (message.includes('valid email')) return 'Enter a valid email address'
  if (message.includes('Email not confirmed')) return 'Confirm your email first, then sign in'
  return message
}
