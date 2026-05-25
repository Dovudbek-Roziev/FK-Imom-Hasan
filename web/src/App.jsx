import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/coach/Dashboard';
import Players from './pages/coach/Players';
import Trainings from './pages/coach/Trainings';
import Payments from './pages/coach/Payments';
import TeamStats from './pages/coach/TeamStats';
import Teams from './pages/coach/Teams';
import CoachProfile from './pages/coach/Profile';
import Subscription from './pages/coach/Subscription';
import PlayerHome from './pages/player/Home';
import PlayerTrainings from './pages/player/Trainings';
import PlayerPayment from './pages/player/Payment';
import PlayerMatches from './pages/player/Matches';
import CoachMatches from './pages/coach/Matches';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoaches from './pages/admin/AdminCoaches';

function ProtectedRoute({ children, requiredRole }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!role) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/login" replace />;
  return children;
}

function LandingRoute() {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (role === 'coach') return <Navigate to="/dashboard" replace />;
  if (role === 'player') return <Navigate to="/player/home" replace />;
  return <Landing />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<Login />} />

      {/* Coach routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/players" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><Players /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/teams" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><Teams /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/trainings" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><Trainings /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><Payments /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/stats" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><TeamStats /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><CoachProfile /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><Subscription /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/matches" element={
        <ProtectedRoute requiredRole="coach">
          <Layout><CoachMatches /></Layout>
        </ProtectedRoute>
      } />

      {/* Player routes */}
      <Route path="/player/home" element={
        <ProtectedRoute requiredRole="player">
          <Layout><PlayerHome /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/player/trainings" element={
        <ProtectedRoute requiredRole="player">
          <Layout><PlayerTrainings /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/player/payment" element={
        <ProtectedRoute requiredRole="player">
          <Layout><PlayerPayment /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/player/matches" element={
        <ProtectedRoute requiredRole="player">
          <Layout><PlayerMatches /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminLayout><AdminDashboard /></AdminLayout>
      } />
      <Route path="/admin/coaches" element={
        <AdminLayout><AdminCoaches /></AdminLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}
