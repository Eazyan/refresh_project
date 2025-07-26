# Урок 3.2: Создание и удаление данных через API

На этом уроке мы завершили полный CRUD-цикл (Create, Read, Update, Delete), реализовав создание и удаление задач. Мы связали действия пользователя в React-приложении с нашим FastAPI бэкендом.

## Ключевые концепции, которые мы изучили:

1.  **Отправка данных с фронтенда (`POST` запросы)**:
    *   Использовали `fetch` для отправки `POST` запроса на сервер при создании новой задачи.
    *   Научились передавать данные в теле запроса (`body`) в формате JSON, используя `JSON.stringify()`.
    *   Установили правильный заголовок `Content-Type: application/json`, чтобы сервер понимал, какой тип данных мы ему отправляем.

2.  **Обработка `POST` запросов на FastAPI**:
    *   Создали Pydantic-модель (`TaskCreate`) для валидации входящих данных. FastAPI автоматически проверяет, что тело запроса соответствует этой модели.
    *   Реализовали эндпоинт `@app.post("/api/tasks")`, который принимает данные, создает новую задачу с уникальным `id` и добавляет ее в наш "mock" список.
    *   Возвращали созданную задачу обратно на фронтенд, чтобы UI мог немедленно обновиться с корректными данными от сервера (включая `id`).

3.  **Асинхронное обновление состояния в React**:
    *   Столкнулись с классической проблемой асинхронности: UI обновлялся раньше, чем сервер успевал ответить.
    *   Решили эту проблему, переместив логику обновления состояния (`dispatch`, очистка инпута) внутрь `.then()` блока `fetch`-промиса. Это гарантирует, что UI обновляется только *после* успешного подтверждения от сервера.

4.  **Удаление данных (`DELETE` запросы)**:
    *   Использовали `fetch` для отправки `DELETE` запроса.
    *   Научились передавать идентификатор удаляемого ресурса как **параметр пути** (`path parameter`), формируя URL вида `/api/tasks/{task_id}`.

5.  **Обработка `DELETE` запросов и правильные HTTP-статусы**:
    *   Написали эндпоинт `@app.delete("/api/tasks/{task_id}")`.
    *   Улучшили его, добавив обработку ошибок: если задача с указанным `id` не найдена, сервер возвращает осмысленный статус `404 Not Found` с помощью `HTTPException`.
    *   При успешном удалении сервер возвращает статус `204 No Content`, что является стандартной практикой для `DELETE` запросов.

## Фрагменты итогового кода:

### `task-manager/src/components/TaskForm.tsx` (отправка `POST` запроса)
```tsx
const handleSubmit = (event: React.FormEvent) => {
    // ...
    fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(newTask => {
        dispatch({ type: 'ADD_TASK', payload: newTask });
        onInputChange('');
        onFormSubmit();
    })
    // ...
};
```

### `task-manager/src/components/TaskItem.tsx` (отправка `DELETE` запроса)
```tsx
const handleDelete = () => {
  fetch(`http://localhost:8000/api/tasks/${task.id}`, {
    method: 'DELETE',
  })
  .then(response => {
    if (response.ok) {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
    } else {
      console.error('Failed to delete task');
    }
  })
  .catch(error => {
    console.error('Error sending delete request:', error);
  });
};
```

### `task-manager-backend/main.py` (эндпоинты `POST` и `DELETE`)
```python
# ...
class TaskCreate(BaseModel):
    text: str

@app.post("/api/tasks", status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate):
    new_task = {
        "id": str(uuid.uuid4()),
        "text": task_data.text
    }
    mock_tasks_data.append(new_task)
    return new_task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    task_to_delete = next((task for task in mock_tasks_data if task["id"] == task_id), None)
    
    if not task_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    mock_tasks_data.remove(task_to_delete)
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)
``` 