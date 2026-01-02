import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { TraineeDashboard } from './components/trainee/TraineeDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <TraineeDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
