import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/home/Home';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FocusLayout } from '../components/layout/FocusLayout';
import UnderConstruction from '../components/ui/UnderConstruction';

import AdminExams from '../pages/dashboard/admin/AdminExams';
import TopicList from '../pages/dashboard/admin/TopicList';
import LevelList from '../pages/dashboard/admin/LevelList';
import QuestionList from '../pages/dashboard/admin/QuestionList';
import AdminSettings from '../pages/dashboard/admin/AdminSettings';
import StudentHome from '../pages/dashboard/student/StudentHome';
import ExploreExams from '../pages/dashboard/student/ExploreExams';
import ExamTrail from '../pages/dashboard/student/ExamTrail';
import SimulationEngine from '../pages/dashboard/student/SimulationEngine';
import SimulationResults from '../pages/dashboard/student/SimulationResults';
import Profile from '../pages/dashboard/student/Profile';
import ProfileSettings from '../pages/dashboard/student/ProfileSettings';
import Achievements from '../pages/dashboard/student/Achievements';
import SimulationsHistory from '../pages/dashboard/student/SimulationsHistory';
import Leaderboard from '../pages/dashboard/student/Leaderboard';

const DashboardIndex = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return (
      <UnderConstruction
        title="Dashboard"
        message="Visão geral e estatísticas em breve."
      />
    );
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

        <Route path="simulations" element={<SimulationsHistory />} />

        <Route path="explore" element={<ExploreExams />} />
        <Route path="explore/:examId" element={<ExamTrail />} />

        <Route path="profile" element={<Profile />} />
        <Route path="profile/settings" element={<ProfileSettings />} />
        <Route path="profile/achievements" element={<Achievements />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route
          path="settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
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

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <FocusLayout />
          </PrivateRoute>
        }
      >
        <Route
          path="simulations/engine/:levelId"
          element={<SimulationEngine />}
        />
        <Route path="simulations/results" element={<SimulationResults />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
