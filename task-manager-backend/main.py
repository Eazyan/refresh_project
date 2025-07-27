from datetime import timedelta
from typing import List
import uuid

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.config import settings
from core.db import get_db
from core.kafka_producer import send_task_event
from core.redis_client import get_cache, invalidate_cache, set_cache
from core.security import create_access_token, get_password_hash, verify_password
from models import Task, User

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

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
    user_id: uuid.UUID

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: str | None = None


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.id).first()
    if user is None:
        raise credentials_exception
    return user


# --- Эндпоинты API ---

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Получить задачи из базы данных для текущего пользователя."""

    cache_key = f"tasks_for_user_{current_user.id}"
    cached_tasks = get_cache(cache_key)
    if cached_tasks is not None:
        return [TaskResponse.model_validate(task) for task in cached_tasks]

    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()

    tasks_to_cache = [TaskResponse.model_validate(task).model_dump() for task in tasks]
    set_cache(cache_key, tasks_to_cache)

    return tasks

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    """Создать новую задачу и сохранить ее в базу данных."""

    new_task_db = Task(text=task_data.text, user_id=current_user.id)
    
    db.add(new_task_db)
    db.commit()
    db.refresh(new_task_db)

    cache_key = f"tasks_for_user_{current_user.id}"
    invalidate_cache(cache_key)

    task_dict = TaskResponse.model_validate(new_task_db).model_dump()
    send_task_event('TASK_CREATED', task_dict)

    return new_task_db

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Найти и удалить задачу из базы данных по ее ID."""
    task_to_delete = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    
    if not task_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
    db.delete(task_to_delete)
    db.commit()

    cache_key = f"tasks_for_user_{current_user.id}"
    invalidate_cache(cache_key)
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.post("/api/users/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Создать нового пользователя и сохранить его в базу данных."""

    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    password = get_password_hash(user_data.password)
    new_user_db = User(email=user_data.email, password=password)
    
    db.add(new_user_db)
    db.commit()
    db.refresh(new_user_db)
    
    return new_user_db

@app.post("/api/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Получить токен для доступа к API."""
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}