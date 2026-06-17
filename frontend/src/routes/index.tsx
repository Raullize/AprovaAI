import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/home/Home';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import UnderConstruction from '../components/ui/UnderConstruction';
import CreateSimulation from '../pages/dashboard/simulations/CreateSimulation';

import AdminExams from '../pages/dashboard/admin/AdminExams';
import TopicList from '../pages/dashboard/admin/TopicList';
import LevelList from '../pages/dashboard/admin/LevelList';
import QuestionList from '../pages/dashboard/admin/QuestionList';
import StudentHome from '../pages/dashboard/student/StudentHome';
import ExploreExams from '../pages/dashboard/student/ExploreExams';
import ExamTrail from '../pages/dashboard/student/ExamTrail';
import SimulationEngine from '../pages/dashboard/student/SimulationEngine';
import SimulationResults from '../pages/dashboard/student/SimulationResults';

const DashboardIndex = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <UnderConstruction title="Dashboard" message="Visão geral e estatísticas em breve." />;
  }
  return <StudentHome />;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primary-600">
        Carregando...
      </div>
    );
  }

  return signed ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primary-600">
        Carregando...
      </div>
    );
  }

  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
};

export function AppRoutes() {
  return (
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
        <Route index element={<DashboardIndex />} />

        <Route
          path="simulations"
          element={
            <div className="space-y-6">
              <UnderConstruction
                title="Listagem de Simulados"
                message="O histórico de simulados estará disponível aqui."
              />
            </div>
          }
        />

        <Route path="explore" element={<ExploreExams />} />
        <Route path="explore/:examId" element={<ExamTrail />} />
        <Route path="simulations/create" element={<CreateSimulation />} />
        <Route path="simulations/engine/:levelId" element={<SimulationEngine />} />
        <Route path="simulations/results" element={<SimulationResults />} />

        <Route
          path="profile"
          element={
            <UnderConstruction
              title="Meu Perfil"
              message="Edição de dados pessoais em breve."
            />
          }
        />
        <Route
          path="settings"
          element={
            <UnderConstruction
              title="Configurações"
              message="Preferências do sistema em breve."
            />
          }
        />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UnderConstruction
                title="Gestão de Usuários"
                message="Controle de acesso e usuários em breve."
              />
            </AdminRoute>
          }
        />
        <Route
          path="exams"
          element={
            <AdminRoute>
              <AdminExams />
            </AdminRoute>
          }
        />

        <Route
          path="admin/exams/:examId/topics"
          element={
            <AdminRoute>
              <TopicList />
            </AdminRoute>
          }
        />

        <Route
          path="admin/topics/:topicId/levels"
          element={
            <AdminRoute>
              <LevelList />
            </AdminRoute>
          }
        />

        <Route
          path="admin/levels/:levelId/questions"
          element={
            <AdminRoute>
              <QuestionList />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
