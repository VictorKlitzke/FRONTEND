import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes'
import { ErrorBoundary } from './shared/ErrorBoundary'
import { AppAlertProvider } from './app/AppAlertProvider'
import { applyBranding, clearBranding } from './feature/config/utils/apply-branding'

const shouldUsePersistedBranding = () => {
  const path = window.location.pathname.toLowerCase();
  const authOrPublicPaths = ["/login", "/register", "/empresa", "/public"];
  return !authOrPublicPaths.some((prefix) => path.startsWith(prefix));
}

const storedSettings = sessionStorage.getItem('settings-storage')
if (storedSettings && shouldUsePersistedBranding()) {
  try {
    applyBranding(JSON.parse(storedSettings))
  } catch {
    // ignore invalid storage
  }
} else {
  clearBranding()
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
