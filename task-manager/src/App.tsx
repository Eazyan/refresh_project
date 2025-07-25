import './App.css';
import { Routes, Route, NavLink } from 'react-router-dom';
import { TasksProvider } from './state/TasksContext';
import TasksPage from './pages/TasksPage';
import CompletedPage from './pages/CompletedPage';
import ProfilePage from './pages/ProfilePage';

function App() {

  return (

    <TasksProvider>

      <div className='app-container'>
        
        <nav className="main-nav">
          <NavLink to="/">Все задачи</NavLink>
          <NavLink to="/completed">Выполненные</NavLink>
          <NavLink to="/profile">Профиль</NavLink>
        </nav>

        <main className="content">
            <Routes>
              <Route path="/" element={<TasksPage />} />
              <Route path="/completed" element={<CompletedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </main>
        
      </div>

    </TasksProvider>
  );
}

export default App;