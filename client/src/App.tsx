import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Container, CircularProgress, Box } from '@mui/material'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import MatchmakingPage from './pages/MatchmakingPage'
import TutorialPage from './pages/TutorialPage'
import TeamPage from './pages/TeamPage'
import PokedexPage from './pages/PokedexPage'
import PokeRoulettePage from './pages/PokeRoulettePage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'

// Composant pour les routes protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

// Route racine qui redirige en fonction de l'authentification
const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <HomePage />
}

const AppRoutes = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()

  // Ne pas afficher le header sur la page de tutoriel
  const showHeader = location.pathname !== '/tutorial'

  return (
    <Box>
      {showHeader && <Header />}
      <Box component="main" sx={{ px: showHeader ? 4 : 0 }}>
        <Routes>
          {/* Route racine avec redirection conditionnelle */}
          <Route path="/" element={<RootRoute />} />
          
          {/* Routes d'authentification */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <LoginPage />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/tutorial" /> : <RegisterPage />
          } />
          
          {/* Route du tutoriel (accessible uniquement si authentifié) */}
          <Route path="/tutorial" element={
            isAuthenticated ? <TutorialPage /> : <Navigate to="/login" />
          } />
          
          {/* Routes protégées */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage user={user!} onLogout={logout} />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/matchmaking"
            element={
              <ProtectedRoute>
                <MatchmakingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pokedex"
            element={
              <ProtectedRoute>
                <PokedexPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roulette"
            element={
              <ProtectedRoute>
                <PokeRoulettePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App 