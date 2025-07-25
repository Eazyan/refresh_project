import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css'; // Используем общие стили

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
    <div className='app-container'>
        <nav className="main-nav">
            <NavLink to="/">Все задачи</NavLink>
            <NavLink to="/completed">Выполненные</NavLink>
            <NavLink to="/profile">Профиль</NavLink>
        </nav>
        <main className="content">
            {children}
        </main>
    </div>
    );
};

export default Layout;