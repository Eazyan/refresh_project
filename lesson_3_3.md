# Урок 3.3: PostgreSQL и SQLAlchemy — Итоги

## Что мы изучили и реализовали:

1.  **Запуск базы данных**: Мы развернули PostgreSQL в изолированном Docker-контейнере с помощью файла `docker-compose.yml`, что является стандартом для современной разработки.
2.  **Безопасная конфигурация**: Научились хранить секретные данные (URL базы данных) в `.env` файле и читать их в приложении с помощью библиотеки `pydantic-settings`, избегая хардкодинга паролей.
3.  **ORM и модели данных**: Создали SQLAlchemy-модель `Task`, которая является Python-представлением нашей таблицы `tasks` в базе данных.
4.  **Миграции базы данных**: Освоили `Alembic`. Мы инициализировали окружение, настроили его и сгенерировали нашу первую автоматическую миграцию для создания таблицы `tasks`. Это ключевой навык для эволюции схемы БД.
5.  **Интеграция с FastAPI**: Мы полностью переписали все эндпоинты (`GET`, `POST`, `DELETE`) для работы с базой данных через сессии SQLAlchemy, используя механизм зависимостей (`Depends(get_db)`) для управления соединениями.
6.  **Pydantic для ответов**: Создали отдельную Pydantic-модель `TaskResponse` с `from_attributes = True`, чтобы корректно преобразовывать SQLAlchemy-объекты в JSON для ответов API.

## Ключевые выводы и важные замечания:

### 1. Разделение ответственности на бэкенде

Наш бэкенд-проект обрел профессиональную структуру, где каждый файл отвечает за свою часть работы:
-   **`main.py`**: Отвечает только за определение эндпоинтов и координацию.
-   **`core/`**: Папка для "ядра" приложения — конфигурации (`config.py`) и подключения к БД (`db.py`).
-   **`models/`**: Папка для определения SQLAlchemy-моделей (структуры таблиц).
-   **`alembic/`**: Папка для управления миграциями базы данных.

### 2. CRUD-операции в SQLAlchemy

Мы на практике изучили основные команды для работы с данными:
-   **Create (Создание)**: `new_task = Task(...)`, `db.add(new_task)`, `db.commit()`, `db.refresh(new_task)`.
-   **Read (Чтение)**: `db.query(Task).all()` (для всех записей), `db.query(Task).filter(Task.id == ...).first()` (для одной записи).
-   **Delete (Удаление)**: `db.delete(task_object)`, `db.commit()`.

### 3. Разница между моделями Pydantic и SQLAlchemy

Мы четко разделили три типа моделей:
-   **SQLAlchemy Model (`Task`)**: Описывает таблицу в базе данных. Используется для общения с БД.
-   **Pydantic Input Model (`TaskCreate`)**: Описывает, какие данные мы ожидаем от клиента *на вход*.
-   **Pydantic Output Model (`TaskResponse`)**: Описывает, какие данные мы отправляем клиенту *в ответ*.

Это разделение делает API строгим, предсказуемым и хорошо документированным.

---

## Финальный код урока:

### `task-manager-backend/main.py`
```python
import uuid
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.db import get_db
from models.task import Task

app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Модели ---

class TaskCreate(BaseModel):
    """Модель для создания задачи (принимает только текст)."""
    text: str

class TaskResponse(BaseModel):
    """Модель для ответа (включает все поля из БД)."""
    id: uuid.UUID
    text: str
    completed: bool

    class Config:
        from_attributes = True

# --- Эндпоинты API ---

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    """Получить все задачи из базы данных."""
    tasks = db.query(Task).all()
    return tasks

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """Создать новую задачу и сохранить ее в базу данных."""
    new_task_db = Task(text=task_data.text)
    db.add(new_task_db)
    db.commit()
    db.refresh(new_task_db)
    return new_task_db

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db)):
    """Найти и удалить задачу из базы данных по ее ID."""
    task_to_delete = db.query(Task).filter(Task.id == task_id).first()
    
    if not task_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
    db.delete(task_to_delete)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)