# Проект: Task Manager (Fullstack)

---

## Структура проекта

```
refresh_project/
├── task-manager/                # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskForm.css
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskItem.css
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskList.css
│   │   ├── pages/
│   │   │   ├── TasksPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── CompletedPage.tsx
│   │   ├── state/
│   │   │   ├── types.ts
│   │   │   ├── tasksReducer.ts
│   │   │   └── TasksContext.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── README.md
├── task-manager-backend/        # Backend (FastAPI + SQLAlchemy + Alembic)
│   ├── main.py
│   ├── core/
│   │   ├── db.py
│   │   └── config.py
│   ├── models/
│   │   └── task.py
│   └── alembic/
│       ├── env.py
│       ├── script.py.mako
│       └── versions/
│           └── ae25cdee00ee_create_tasks_table.py
```

---

# FRONTEND (task-manager)

## package.json
```json
{
  "name": "task-manager",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-flip-toolkit": "^7.2.4",
    "react-router-dom": "^7.7.1",
    "react-transition-group": "^4.4.5",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.30.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@types/react-transition-group": "^4.4.12",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^9.30.1",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.35.1",
    "vite": "^7.0.4"
  }
}
```

## src/App.tsx
```tsx
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

## src/main.tsx
```tsx
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

## src/components/Layout.tsx
```tsx
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

## src/pages/TasksPage.tsx
```tsx
import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

const TasksPage: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);

    const toggleForm = () => {
        setShowInput(!showInput);
    };

    return (
    <>
        <div className="task-action-container">
            <TaskForm
                isVisible={showInput}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onFormSubmit={toggleForm} 
            />
        </div>

        <TaskList />
    </>
    );
};

export default TasksPage;
```

## src/pages/ProfilePage.tsx
```tsx
import React from 'react';

const ProfilePage: React.FC = () => {
    return <h2>Профиль пользователя</h2>;
};

export default ProfilePage;
```

## src/pages/CompletedPage.tsx
```tsx
import React from 'react';

const CompletedPage: React.FC = () => {
    return <h2>Выполненные задачи</h2>;
};

export default CompletedPage;
```

## src/components/TaskForm.tsx
```tsx
import React, { useContext, useRef } from 'react';
import './TaskForm.css';
import { TasksContext } from '../state/TasksContext'; 

type TaskFormProps = {
  isVisible: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onFormSubmit: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ isVisible, inputValue, onInputChange, onFormSubmit }) => {

  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('TaskForm must be used within a TasksProvider');
  }
  
  const formRef = useRef<HTMLFormElement>(null);
  const { dispatch } = context;
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isVisible) {
        onFormSubmit();
        return;
    }

    const text = inputValue.trim();
    if (text === '') {
        onFormSubmit();
        return;
    }

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
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
  };

  const handleClick = (event: React.MouseEvent) => {

    if (!isVisible) {
      event.preventDefault();
      onFormSubmit();
    }

  };

  return (

    <form
      ref={formRef}
      onSubmit={handleSubmit} 
      className={`add-task-form ${isVisible ? 'visible' : ''}`}
      onClick={handleClick}
    >

      <div className="add-task-button__icon"></div>
      <input
        autoFocus={isVisible}
        type="text"
        placeholder="Что нужно сделать?"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        className="add-task-input"
      />
      <button 
        type="submit" 
        className="add-task-submit"
        aria-label="Добавить задачу"
      >
        <span className="add-task-submit__icon">➤</span>
      </button>

    </form>

  );
};

export default TaskForm;
```

## src/components/TaskItem.tsx
```tsx
import React, { useContext } from 'react';
import './TaskItem.css';
import { TasksContext } from '../state/TasksContext';

type TaskItemProps = {
  task: {
    id: string;
    text: string;
  };
  className?: string;
  style?: React.CSSProperties;
};

const TaskItem = React.forwardRef<HTMLLIElement, TaskItemProps>(
  ({ task, className, style }, ref) => {

    const context = useContext(TasksContext);
    if (!context) {
      throw new Error('TaskItem must be used within a TasksProvider');
    }
    const { dispatch } = context;

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

    return (
      <li
        className={`task-item ${className || ''}`}
        style={style}
        onClick={handleDelete}
        ref={ref}
      >
        {task.text}
      </li>
    );
  }
);

export default TaskItem;
```

## src/components/TaskList.tsx
```tsx
import React, { useContext } from 'react';
import TaskItem from "./TaskItem";
import './TaskList.css';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { TasksContext } from '../state/TasksContext';

const TaskList: React.FC = () => {
    const context = useContext(TasksContext);
    if (!context) {
      throw new Error('TaskList must be used within a TasksProvider');
    }
    const { tasks } = context;

    return (
      <Flipper flipKey={tasks.map(t => t.id).join('')}>
        <TransitionGroup component="ul" className='task-list'>
          {tasks.map(task => {
            const nodeRef = React.createRef<HTMLLIElement>();
            return (
              <CSSTransition
                key={task.id}
                nodeRef={nodeRef}
                timeout={300}
                classNames="task-anim"
              >
                <Flipped flipId={task.id}>
                  <TaskItem
                    ref={nodeRef}
                    task={task}
                  />
                </Flipped>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      </Flipper>
    );
  };
  
  export default TaskList;
```

## src/state/types.ts
```ts
export type Task = {
    id: string;
    text: string;
};

export type Action =
| { type: 'ADD_TASK'; payload: Task }
| { type: 'DELETE_TASK'; payload: string }
| { type: 'SET_TASKS'; payload: Task[] };
```

## src/state/tasksReducer.ts
```ts
import type { Action, Task } from './types';

export const tasksReducer = (state: Task[], action: Action): Task[] => {
    switch (action.type) {
        case 'ADD_TASK':
            return [ ...state, action.payload ];
        case 'DELETE_TASK':
            return state.filter(task => task.id !== action.payload);
        case 'SET_TASKS':
            return action.payload;
        default:
            return state;
    }
};
```

## src/state/TasksContext.tsx
```tsx
import React, { createContext, useReducer, useEffect } from 'react';
import { tasksReducer } from './tasksReducer';
import type { Task, Action } from './types';

type TasksContextType = {
  tasks: Task[];
  dispatch: React.Dispatch<Action>;
};

export const TasksContext = createContext<TasksContextType | undefined>(undefined);
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, dispatch] = useReducer(tasksReducer, []);
    useEffect(() => {
        fetch('http://localhost:8000/api/tasks')
        .then(response => response.json())
        .then(data => {
            dispatch({ type: 'SET_TASKS', payload: data })
        });
    }, []);
    return (
        <TasksContext.Provider value={{ tasks, dispatch }}>
            {children}
        </TasksContext.Provider>
    );
};
```

---

# BACKEND (task-manager-backend)

## main.py
```python
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
```

## core/db.py
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## core/config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
```

## models/task.py
```python
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from core.db import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
```

## alembic/env.py
```python
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.task import Task
from core.db import Base

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## alembic/versions/ae25cdee00ee_create_tasks_table.py
```python
"""Create tasks table

Revision ID: ae25cdee00ee
Revises: 
Create Date: 2025-07-27 00:17:44.511698

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'ae25cdee00ee'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table('tasks',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('text', sa.String(), nullable=False),
    sa.Column('completed', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('tasks')
``` 