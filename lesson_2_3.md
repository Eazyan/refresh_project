# Урок 2.3: Навигация и роутинг с React Router

## Цели урока
-   Познакомиться с библиотекой `react-router-dom`.
-   Превратить одностраничное приложение (SPA) в многостраничное с помощью клиентского роутинга.
-   Реорганизовать структуру проекта, выделив "страницы" и "макет" (Layout).

## Ключевые концепции

### 1. React Router
Это стандартная библиотека для организации навигации в React-приложениях. Она позволяет синхронизировать UI с URL в браузере, создавая иллюзию перехода по разным страницам без перезагрузки всей страницы.

-   **`<BrowserRouter>`**: Компонент-обертка, который включает историю навигации в браузере. Его размещают как можно выше в дереве компонентов, обычно в `main.tsx`.
-   **`<Routes>` и `<Route>`**: `<Routes>` работает как `switch` — он просматривает свои дочерние `<Route>` и отображает первый, чей `path` совпадает с текущим URL.
-   **`<NavLink>` (и `<Link>`)**: Компоненты для создания навигационных ссылок. Они рендерятся в обычные теги `<a>`, но перехватывают клики, чтобы предотвратить перезагрузку страницы. `<NavLink>` — это особый вид `<Link>`, который умеет добавлять себе CSS-класс (по умолчанию `active`), если его `to` совпадает с текущим URL.

### 2. Рефакторинг архитектуры: Страницы и Макет (Layout)

По мере роста приложения хранить всё в `App.tsx` становится неудобно. Мы провели важный рефакторинг:

-   **Папка `src/pages`**: Мы создали эту директорию для хранения компонентов, которые представляют собой целые "страницы" приложения (`TasksPage`, `ProfilePage` и т.д.). Это помогает отделить логику конкретной страницы от общей логики приложения.
-   **Компонент `Layout`**: Мы вынесли всю общую для всех страниц разметку (контейнер, навигационное меню) в отдельный компонент `Layout.tsx`. Этот компонент принимает `children` и отрисовывает их внутри себя. Такой подход называется **композицией** и является одной из ключевых идей React.

## Итоги и написанный код

### 1. Установка `react-router-dom`
Мы добавили новую зависимость в проект:
`npm install react-router-dom`

### 2. Обновление `main.tsx`
Мы обернули все приложение в `<BrowserRouter>`, чтобы включить роутинг.

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

### 3. Создание страниц (`src/pages`)
Мы создали три компонента-страницы, перенеся логику отображения задач в `TasksPage`.

```tsx
// src/pages/TasksPage.tsx
import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const TasksPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <>
      {showInput ? (
        <TaskForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onFormSubmit={() => setShowInput(false)}
        />
      ) : (
        <button
          className='add-task-button add-task-button--standalone'
          onClick={() => setShowInput(true)}
        >
          Новая задача
        </button>
      )}
      <TaskList />
    </>
  );
};

export default TasksPage;
```

### 4. Создание `Layout.tsx`
Выделили общую разметку в переиспользуемый компонент.

```tsx
// src/components/Layout.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css'; 

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
```

### 5. Финальный `App.tsx`
После рефакторинга `App.tsx` стал очень чистым. Его единственная задача — предоставлять глобальные контексты (`TasksProvider`) и определять, какая страница будет показана для какого URL.

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { TasksProvider } from './state/TasksContext';
import Layout from './components/Layout';
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
```

### 6. Стили для навигации (`App.css`)
Мы добавили стили для навигационного меню, включая специальный класс `.active` для `NavLink`.

```css
/* src/App.css */
.main-nav {
  display: flex;
  gap: 20px;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2c2f48;
}

.main-nav a {
  text-decoration: none;
  color: #a0a0a0;
  font-weight: 500;
  padding: 8px 15px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.main-nav a:hover {
  background-color: #2c2f48;
  color: #fff;
}

.main-nav a.active {
  background-color: #5061FC;
  color: #fff;
  box-shadow: 0 4px 8px rgba(80, 97, 252, 0.2);
}

.content {
  position: relative;
  flex: 1;
  overflow-y: auto;
}
```

Отличная работа! Теперь мы готовы к следующему большому шагу — работе с сервером. 