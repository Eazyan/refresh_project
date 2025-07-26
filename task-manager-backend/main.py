import uuid
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from core.db import get_db
from models.task import Task

app = FastAPI()

# --- CORS ---

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