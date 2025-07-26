from fastapi import FastAPI, HTTPException, Response, status
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

app = FastAPI()

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

class TaskCreate(BaseModel):
    text: str

mock_tasks_data = [
    {"id": "1", "text": "Изучить React"},
    {"id": "2", "text": "Создать первое приложение"},
    {"id": "3", "text": "Понять структуру проекта"},
    {"id": "4", "text": "Настроить стили"},
    {"id": "5", "text": "Добавить задачи"},
]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/tasks")
def get_tasks() -> List[Dict[str, str]]:
    return mock_tasks_data

@app.post("/api/tasks")
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
