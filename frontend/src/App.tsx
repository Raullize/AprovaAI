import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/Toaster';
import UnderConstruction from './components/ui/UnderConstruction';
import CreateSimulation from './pages/dashboard/simulations/CreateSimulation';
import Button from './components/ui/Button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminExams from './pages/dashboard/admin/AdminExams';
import TopicList from './pages/dashboard/admin/TopicList';
import TopicForm from './pages/dashboard/admin/TopicForm';
import LevelList from './pages/dashboard/admin/LevelList';
import LevelForm from './pages/dashboard/admin/LevelForm';
import QuestionList from './pages/dashboard/admin/QuestionList';
import QuestionForm from './pages/dashboard/admin/QuestionForm';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
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
            <Route index element={<UnderConstruction title="Dashboard" message="Visão geral e estatísticas em breve." />} />
            
            <Route path="simulations" element={
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Simulados</h1>
                  <Link to="/dashboard/simulations/create">
                    <Button>
                      <Plus className="h-5 w-5 mr-2" />
                      Novo Simulado
                    </Button>
                  </Link>
                </div>
                <UnderConstruction title="Listagem de Simulados" message="O histórico de simulados estará disponível aqui." />
              </div>
            } />
            
            <Route path="simulations/create" element={<CreateSimulation />} />
            
            <Route path="profile" element={<UnderConstruction title="Meu Perfil" message="Edição de dados pessoais em breve." />} />
            <Route path="settings" element={<UnderConstruction title="Configurações" message="Preferências do sistema em breve." />} />
            <Route path="users" element={<UnderConstruction title="Gestão de Usuários" message="Controle de acesso e usuários em breve." />} />

            {/* Admin Routes - Agora integrados em "Meus Exames" e afins */}
            <Route path="exams" element={<AdminExams />} />
            
            <Route path="admin/exams/:examId/topics" element={<TopicList />} />
            <Route path="admin/exams/:examId/topics/new" element={<TopicForm />} />
            <Route path="admin/exams/:examId/topics/:topicId/edit" element={<TopicForm />} />
            
            <Route path="admin/topics/:topicId/levels" element={<LevelList />} />
            <Route path="admin/topics/:topicId/levels/new" element={<LevelForm />} />
            <Route path="admin/topics/:topicId/levels/:levelId/edit" element={<LevelForm />} />
            
            <Route path="admin/levels/:levelId/questions" element={<QuestionList />} />
            <Route path="admin/levels/:levelId/questions/new" element={<QuestionForm />} />
            <Route path="admin/levels/:levelId/questions/:questionId/edit" element={<QuestionForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
