import { Routes, Route } from 'react-router-dom';
import { TasksProvider } from './state/TasksContext';
import Layout from './components/Layout'; // Импортируем Layout
import TasksPage from './pages/TasksPage';
import CompletedPage from './pages/CompletedPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <TasksProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<TasksPage />} />
          <Route path="/completed" element={<CompletedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </TasksProvider>
  );
}

export default App;