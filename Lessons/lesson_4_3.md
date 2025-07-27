# Урок 4.3: Авторизация на Frontend — Итоги

## Что мы изучили и реализовали:

1.  **`Context API` для аутентификации**: Мы создали отдельный `AuthContext` для управления состоянием аутентификации (`token` и функции `login`, `logout`). Это позволило нам изолировать логику авторизации от логики задач.
2.  **Кастомный хук `useAuth`**: Написали собственный хук `useAuth` для удобного и безопасного доступа к `AuthContext` из любого компонента.
3.  **Страницы входа и регистрации**: Создали новые страницы (`LoginPage`, `RegisterPage`) с формами для взаимодействия с пользователем.
4.  **Интеграция с React Router**: Добавили новые роуты и создали динамическую навигацию в компоненте `Layout`, которая меняется в зависимости от статуса логина пользователя.
5.  **Взаимодействие с API**: Реализовали логику отправки запросов на эндпоинты `/api/users/register` и `/api/token`. Научились работать с разными форматами тела запроса (`JSON` для регистрации и `x-www-form-urlencoded` для входа).
6.  **Сохранение сессии (`localStorage`)**: Обеспечили персистентность сессии, сохраняя JWT-токен в `localStorage`. Теперь пользователь остается залогиненным даже после перезагрузки страницы.
7.  **`axios` и Interceptors (перехватчики)**: Установили библиотеку `axios` и настроили `interceptor`, который **автоматически** добавляет `Authorization` заголовок с JWT-токеном ко всем исходящим запросам. Это мощный паттерн, который избавляет от необходимости добавлять заголовок вручную в каждом `fetch`.

## Ключевые выводы и важные замечания:

### 1. Разделение контекстов

Создание отдельных контекстов для разных "областей" приложения (`TasksContext`, `AuthContext`) — это хорошая архитектурная практика. Она предотвращает превращение одного глобального состояния в "свалку" и делает код более модульным и понятным.

### 2. Программная навигация (`useNavigate`)

Мы научились использовать хук `useNavigate` из `react-router-dom` для перенаправления пользователя после успешного выполнения действия (например, после регистрации на страницу входа).

### 3. Работа с `localStorage`

Мы увидели, как `localStorage` в связке с `useEffect` позволяет синхронизировать состояние React с хранилищем браузера, обеспечивая сохранение пользовательской сессии.

### 4. Централизованная работа с API

Создание `apiClient` с помощью `axios` — это стандарт индустрии. Вместо разрозненных `fetch` по всему приложению у нас теперь есть единая точка для настройки базового URL, заголовков, обработки ошибок и т.д. "Перехватчики" (`interceptors`) — это невероятно мощный инструмент для решения сквозных задач, таких как добавление токена авторизации.

---

## Финальный код урока:

### `task-manager/src/state/AuthContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### `task-manager/src/api/apiClient.ts`
```ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

### `task-manager/src/pages/LoginPage.tsx` (фрагмент с логикой)
```tsx
// ...
import { useAuth } from '../state/AuthContext';
// ...
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  // ...
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  try {
    const response = await fetch('http://localhost:8000/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    });
    // ... обработка ошибок ...
    const data = await response.json();
    login(data.access_token);
    navigate('/');
  } catch (err: any) {
    // ...
  }
};
// ...
```