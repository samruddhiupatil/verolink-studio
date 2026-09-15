import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { AppStateProvider } from './app/AppStateContext'
import { ROUTES } from './app/routeConfig'

function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            {ROUTES.map((route) => (
              <Route key={route.path} path={route.path} element={<route.Component />} />
            ))}
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  )
}

export default App
