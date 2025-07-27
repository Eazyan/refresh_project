# Урок 4.4: Защита эндпоинтов и синхронизация состояния — Итоги

## Что мы изучили и реализовали:

1.  **Зависимости (Dependencies) в FastAPI**: Мы создали мощную зависимость `get_current_user`, которая выступает в роли "стража" для наших эндпоинтов. Она инкапсулирует всю логику по проверке JWT-токена и получению текущего пользователя.
2.  **Защита эндпоинтов**: Мы применили зависимость `get_current_user` ко всем эндпоинтам, работающим с задачами. Теперь для получения, создания или удаления задач требуется валидный токен, иначе сервер вернет ошибку `401 Unauthorized`.
3.  **Авторизация и фильтрация данных**: Мы реализовали ключевую бизнес-логику — **персонализацию данных**. Наши эндпоинты теперь используют `id` пользователя, полученный из токена, для фильтрации запросов к базе данных. Это гарантирует, что пользователи могут видеть и изменять **только свои** задачи.
4.  **Синхронизация состояния Frontend**: Мы решили проблему "рассинхронизации" состояния после логина. Добавив `token` из `AuthContext` в массив зависимостей `useEffect` в `TasksProvider`, мы заставили список задач автоматически перезагружаться при изменении статуса аутентификации.

## Ключевые выводы и важные замечания:

### 1. Разница между Аутентификацией и Авторизацией

На последних уроках мы на практике реализовали оба понятия:
-   **Аутентификация** (проверка "кто ты?"): Происходит на эндпоинте `/api/token`, где пользователь доказывает, кто он, с помощью логина и пароля, и получает токен.
-   **Авторизация** (проверка "что тебе можно?"): Происходит на защищенных эндпоинтах (`/api/tasks`). Зависимость `get_current_user` проверяет токен (аутентифицирует запрос), а затем логика эндпоинта использует `current_user.id` для проверки прав доступа к данным (авторизует операцию).

### 2. Мощь зависимостей FastAPI

Мы увидели, насколько элегантно FastAPI решает сквозные задачи. Вместо того чтобы дублировать код проверки токена в каждом эндпоинте, мы вынесли его в одну переиспользуемую зависимость. Это делает код чистым, сухим (Don't Repeat Yourself) и легко поддерживаемым.

### 3. Реактивность на основе Контекста в React

Проблема с обновлением списка задач после логина наглядно продемонстрировала, как работает система хуков и контекста в React. Изменение состояния в одном контексте (`AuthContext`) может и должно вызывать эффекты в других частях приложения (`TasksProvider`), которые "подписаны" на эти изменения через массив зависимостей `useEffect`.

---

## Финальный код урока:

### `task-manager-backend/main.py` (защищенные эндпоинты)
```python
# ... импорты ...

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # ... код зависимости ...
    
# ...

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.owner_id == current_user.id).all()
    return tasks

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_task_db = Task(text=task_data.text, owner_id=current_user.id)
    db.add(new_task_db)
    db.commit()
    db.refresh(new_task_db)
    return new_task_db

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task_to_delete = db.query(Task).filter(
        Task.id == task_id, 
        Task.owner_id == current_user.id
    ).first()
    # ...
```

### `task-manager/src/state/TasksContext.tsx` (синхронизация по токену)
```tsx
import React, { createContext, useReducer, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from './AuthContext';
import { tasksReducer } from './tasksReducer';
import type { Task, Action } from './types';

// ...

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, dispatch] = useReducer(tasksReducer, []);
    const { token } = useAuth();

    useEffect(() => {
        const fetchTasks = async () => {
            if (!token) {
                dispatch({ type: 'SET_TASKS', payload: [] });
                return;
            }
            try {
                const response = await apiClient.get('/tasks');
                dispatch({ type: 'SET_TASKS', payload: response.data });
            } catch (error) {
                console.error("Failed to fetch tasks", error);
                dispatch({ type: 'SET_TASKS', payload: [] });
            }
        };

        fetchTasks();
    }, [token]); // Зависимость от токена!

    return (
        <TasksContext.Provider value={{ tasks, dispatch }}>
            {children}
        </TasksContext.Provider>
    );
};
```