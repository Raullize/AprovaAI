import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/Toaster';
import { AppRoutes } from './routes';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
