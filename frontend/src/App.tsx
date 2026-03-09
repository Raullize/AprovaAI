import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/Toaster';
import { AppRoutes } from './routes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
