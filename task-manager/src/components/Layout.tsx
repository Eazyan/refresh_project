import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../state/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, logout } = useAuth();

  return (
    <div className='app-container'>
      <nav className="main-nav">
        {token ? (
          <>
            <NavLink to="/">Все задачи</NavLink>
            <NavLink to="/profile">Профиль</NavLink>
            <a href="#" onClick={logout}>Выйти</a>
          </>
        ) : (
          <>
            <NavLink to="/login">Вход</NavLink>
            <NavLink to="/register">Регистрация</NavLink>
          </>
        )}
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default Layout;