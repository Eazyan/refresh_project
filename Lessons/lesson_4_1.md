# Урок 4.1: Модели пользователей и Регистрация — Итоги

## Что мы изучили и реализовали:

1.  **Моделирование данных**: Мы расширили нашу схему данных, добавив модель `User` для хранения информации о пользователях.
2.  **Связывание таблиц (Foreign Key)**: Мы установили реляционную связь между задачами и пользователями, добавив поле `owner_id` в модель `Task` и определив его как `ForeignKey`. Это обеспечивает целостность данных на уровне базы.
3.  **Работа с миграциями (продвинутый уровень)**: Мы столкнулись с реальными проблемами при миграциях и научились их решать:
    *   **`NotNullViolation`**: Поняли, почему нельзя добавить колонку `NOT NULL` в таблицу с существующими данными, и научились решать эту проблему путем очистки данных перед миграцией.
    *   **`Mapper failed to initialize`**: Решили проблему циклических зависимостей между моделями, создав общий `models/__init__.py` для корректной инициализации SQLAlchemy.
    *   **`ForeignKeyViolation`**: На практике увидели, как база данных защищает связи, и поняли важность использования корректных ID.
4.  **Безопасность и хэширование паролей**: Мы реализовали эндпоинт для регистрации, который следует главному правилу безопасности: **никогда не хранить пароли в открытом виде**. Мы использовали библиотеку `passlib` для хэширования паролей перед сохранением в базу.
5.  **Создание пользователя**: Написали эндпоинт `/api/users/register`, который проверяет уникальность email, хэширует пароль и создает новую запись в таблице `users`.

## Ключевые выводы и важные замечания:

### 1. Отладка — это часть работы

На этом уроке мы потратили значительное время на отладку ошибок (`mapper failed`, `NotNullViolation`, `ForeignKeyViolation`). Это не было отклонением от плана — это и **была** самая важная часть урока. Понимание сообщений об ошибках от SQLAlchemy, Alembic и базы данных — это фундаментальный навык бэкенд-разработчика.

### 2. Важность правильной архитектуры импортов

Проблема с `mapper failed to initialize` показала, насколько важна правильная структура проекта. Создание `models/__init__.py` — это стандартный паттерн для решения проблем с циклическими зависимостями в SQLAlchemy и других ORM.

### 3. "Заглушки" и итеративная разработка

Мы использовали "заглушку" (хардкод `current_user_id`), чтобы заставить приложение работать, прежде чем у нас появилась полноценная система аутентификации. Это нормальный и очень распространенный подход в разработке, позволяющий двигаться вперед итеративно.

---

## Финальный код урока:

### `task-manager-backend/models/user.py`
```python
import uuid
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from core.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
```

### `task-manager-backend/models/task.py` (обновленный)
```python
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from core.db import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User")
```

### `task-manager-backend/core/security.py`
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

### `task-manager-backend/main.py` (эндпоинт регистрации)
```python
# ... импорты ...
from models import User, Task
from core.security import get_password_hash

# ... Pydantic модели UserCreate и UserResponse ...

@app.post("/api/users/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user_db = User(email=user_data.email, hashed_password=hashed_password)
    
    db.add(new_user_db)
    db.commit()
    db.refresh(new_user_db)
    
    return new_user_db
```