import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { router } from './router'
import { Aurora } from './shared/components'
import { AuthProvider } from './app/auth/AuthProvider'
import { I18nProvider } from './shared/i18n'
import './index.css'

const pageFallback = (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-muted)',
      fontSize: 14,
    }}
  >
    Loading
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Aurora />
    <I18nProvider>
      <AuthProvider>
        <Suspense fallback={pageFallback}>
          <RouterProvider router={router} />
          <Analytics />
        </Suspense>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
