import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from './app/auth/RequireAuth'

const LandingPage = lazy(() => import('./landing/LandingPage'))
const SignInPage = lazy(() => import('./app/auth/SignInPage'))
const SignUpPage = lazy(() => import('./app/auth/SignUpPage'))
const AppLayout = lazy(() => import('./app/AppLayout'))
const DashboardPage = lazy(() => import('./app/DashboardPage'))
const SanctionsPage = lazy(() => import('./app/modules/sanctions/SanctionsPage'))
const InflationPage = lazy(() => import('./app/modules/inflation/InflationPage'))
const UnemploymentPage = lazy(() => import('./app/modules/unemployment/UnemploymentPage'))
const QualityOfLifePage = lazy(() => import('./app/modules/quality/QualityOfLifePage'))
const AiExplainerPage = lazy(() => import('./app/modules/ai/AiExplainerPage'))
const PropertyLabPage = lazy(() => import('./app/modules/property/PropertyLabPage'))
const NotFound = lazy(() => import('./shared/components/NotFound'))

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/signin', element: <SignInPage /> },
  { path: '/signup', element: <SignUpPage /> },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'sanctions', element: <SanctionsPage /> },
      { path: 'inflation', element: <InflationPage /> },
      { path: 'unemployment', element: <UnemploymentPage /> },
      { path: 'quality-of-life', element: <QualityOfLifePage /> },
      { path: 'ai-explainer', element: <AiExplainerPage /> },
      { path: 'property-lab', element: <PropertyLabPage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
