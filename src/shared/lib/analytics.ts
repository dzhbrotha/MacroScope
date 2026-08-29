import { track } from '@vercel/analytics'

// Counting is the point, not tracking. Vercel's web analytics sets no cookies
// and stores no identifier, so there is nothing to ask consent for and nothing
// about a reader to leak. Every call is wrapped: a measurement failure must
// never take a page down with it.
export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean>,
): void {
  try {
    track(name, data)
  } catch {
    // analytics may be blocked, disabled or absent in development
  }
}
