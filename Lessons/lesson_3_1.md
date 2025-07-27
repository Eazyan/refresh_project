# Урок 3.1: Введение в Backend на Python и FastAPI

## Цели урока
-   Перейти от чистого фронтенда к full-stack приложению.
-   Настроить рабочее окружение для Python-бэкенда.
-   Создать базовый API с помощью FastAPI.
-   Подключить React-приложение к этому API для получения данных.

## Ключевые концепции

### 1. Python Backend
Мы переориентировали курс с Node.js на Python, используя стек, который вы будете применять в реальном проекте.

-   **Виртуальное окружение (`venv`)**: Мы создали изолированное окружение, чтобы зависимости нашего проекта не конфликтовали с системными. Это стандартная и обязательная практика в Python-разработке.
-   **`pip`**: Менеджер пакетов Python, аналог `npm` в мире JavaScript. Мы использовали его для установки библиотек.
-   **FastAPI**: Современный, быстрый (высокопроизводительный) веб-фреймворк для создания API на Python 3.7+. Его ключевые особенности — высокая скорость, простота в использовании и автоматическая генерация интерактивной документации.
-   **Uvicorn**: Это ASGI (Asynchronous Server Gateway Interface) сервер, который необходим для запуска асинхронных фреймворков, таких как FastAPI. Флаг `--reload` очень удобен для разработки, так как автоматически перезапускает сервер при изменениях в коде.

### 2. Full-Stack взаимодействие
-   **API Endpoint**: Мы создали "конечную точку" (`@app.get("/api/tasks")`), по которой фронтенд может "постучаться", чтобы получить данные.
-   **CORS (Cross-Origin Resource Sharing)**: Мы столкнулись с политикой безопасности браузера, которая запрещает запросы между разными "источниками" (origin), в нашем случае — с `localhost:5173` на `localhost:8000`. Мы решили эту проблему, настроив `CORSMiddleware` на стороне FastAPI, явно разрешив нашему фронтенду доступ.
-   **`useEffect` для запросов данных**: Мы поняли, что `useEffect` — это идеальный инструмент для выполнения "побочных эффектов", таких как сетевые запросы. Использование его с пустым массивом зависимостей (`[]`) гарантирует, что запрос будет выполнен только один раз, когда компонент впервые загрузится.
-   **`fetch` API**: Это встроенный в современные браузеры инструмент для выполнения HTTP-запросов. Он работает на основе промисов (`.then()`).

## Итоги и написанный код

### 1. Настройка Backend (`task-manager-backend/main.py`)
Мы создали сервер, который отдает статический список задач и настроен для работы с нашим фронтендом.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

app = FastAPI()

# Список адресов, которым разрешено обращаться к нашему серверу
origins = [
    "http://localhost:5173", # Адрес вашего React-приложения
    "http://127.0.0.1:5173", 
]

# Добавляем middleware для CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mock_tasks_data = [
    {"id": "1", "text": "Изучить React"},
    {"id": "2", "text": "Создать первое приложение"},
    {"id": "3", "text": "Понять структуру проекта"},
]

@app.get("/api/tasks")
def get_tasks() -> List[Dict[str, str]]:
    return mock_tasks_data
```

### 2. Обновление Frontend (`task-manager/src/state/...`)

#### `types.ts`
Мы добавили новый тип действия для установки всех задач разом.
```ts
export type Action =
  | { type: 'ADD_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }; // <-- Новое действие
```

#### `tasksReducer.ts`
Мы научили редюсер обрабатывать это новое действие.
```ts
// ...
        case 'SET_TASKS':
            return action.payload;
// ...
```

#### `TasksContext.tsx`
Это было ключевое изменение. Мы использовали `useEffect` для загрузки данных с сервера и их отправки в `useReducer`.
```tsx
import React, { createContext, useReducer, useEffect } from 'react';
import { tasksReducer } from './tasksReducer';
import type { Task, Action } from './types';

// ...

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, dispatch] = useReducer(tasksReducer, []);

    useEffect(() => {
        fetch('http://localhost:8000/api/tasks')
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'SET_TASKS', payload: data });
            });
    }, []); // <-- Выполняется один раз

    return (
        <TasksContext.Provider value={{ tasks, dispatch }}>
            {children}
        </TasksContext.Provider>
    );
};
```
Отличная работа! Теперь мы готовы к следующему шагу: реализации добавления и удаления задач через API. 