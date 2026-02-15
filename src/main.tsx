import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes'
import { ErrorBoundary } from './shared/ErrorBoundary'
import { AppAlertProvider } from './app/AppAlertProvider'
import { applyBranding } from './feature/config/utils/apply-branding'

const storedSettings = sessionStorage.getItem('settings-storage')
if (storedSettings) {
  try {
    applyBranding(JSON.parse(storedSettings))
  } catch {
    // ignore invalid storage
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppAlertProvider>
        <RouterProvider router={router} />
      </AppAlertProvider>
    </ErrorBoundary>
  </StrictMode>,
)
