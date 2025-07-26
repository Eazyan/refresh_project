import { Routes, Route } from 'react-router-dom';
import { TasksProvider } from './state/TasksContext';
import { AuthProvider } from './state/AuthContext';
import Layout from './components/Layout';
import TasksPage from './pages/TasksPage';
import CompletedPage from './pages/CompletedPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/completed" element={<CompletedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Layout>
      </TasksProvider>
    </AuthProvider>
  );
}

export default App;