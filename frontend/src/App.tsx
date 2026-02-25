import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-primary-600">Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            } 
          >
            <Route index element={
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Bem-vindo ao AprovaAI!</h2>
                <p>Selecione uma opção no menu lateral para começar.</p>
              </div>
            } />
            <Route path="exams" element={<div>Meus Exames (Em breve)</div>} />
            <Route path="simulations" element={<div>Simulados (Em breve)</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
