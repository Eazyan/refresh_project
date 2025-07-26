# Урок 4.2: Вход пользователя и выдача JWT-токена — Итоги

## Что мы изучили и реализовали:

1.  **Концепция JWT (JSON Web Token)**: Мы поняли, как работает stateless-аутентификация. Пользователь обменивает свои учетные данные (логин/пароль) на токен, который затем использует для всех последующих запросов, подтверждая свою личность.
2.  **Установка зависимостей**: Установили библиотеку `python-jose[cryptography]`, которая является стандартом для работы с JWT в экосистеме FastAPI.
3.  **Безопасная конфигурация**: Добавили `SECRET_KEY`, `ALGORITHM` и `ACCESS_TOKEN_EXPIRE_MINUTES` в наш `.env` файл и научили конфиг `pydantic-settings` их читать.
4.  **Создание токенов**: Написали "сервисную" функцию `create_access_token` в `core/security.py`, которая инкапсулирует в себе всю логику по созданию, подписи и установке времени жизни JWT.
5.  **Эндпоинт для входа (`/api/token`)**: Создали эндпоинт, который:
    *   Принимает данные для входа с помощью специальной зависимости FastAPI `OAuth2PasswordRequestForm`.
    *   Ищет пользователя в базе данных.
    *   Проверяет подлинность пароля с помощью нашей функции `verify_password`, сравнивая хэши.
    *   В случае успеха, генерирует и возвращает JWT-токен.
    *   В случае неудачи, возвращает корректную ошибку `401 Unauthorized`.

## Ключевые выводы и важные замечания:

### 1. Stateless-аутентификация

Основное преимущество нашего подхода в том, что серверу не нужно ничего "помнить" о вошедшем пользователе между запросами. Вся необходимая информация (ID пользователя) хранится в самом токене, который приносит клиент. Это делает систему очень масштабируемой и простой.

### 2. Разделение моделей Pydantic

Мы продолжили практику разделения моделей, создав:
-   `UserCreate`: для входных данных при регистрации.
-   `UserResponse`: для выходных данных (без пароля).
-   `Token`: для ответа с access-токеном.

### 3. "Сервисный" слой

Мы вынесли всю сложную логику, не связанную напрямую с обработкой HTTP-запросов (хэширование паролей, создание токенов), в отдельный модуль `core/security.py`. Это делает наш код более чистым, организованным и легким для тестирования.

---

## Финальный код урока:

### `task-manager-backend/.env` (добавленные строки)
```
SECRET_KEY="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### `task-manager-backend/core/config.py` (обновленный)
```python
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    class Config:
        env_file = ".env"
```

### `task-manager-backend/core/security.py` (добавленная функция)
```python
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from core.config import settings

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
```

### `task-manager-backend/main.py` (добавленный эндпоинт)
```python
# ... импорты ...
from fastapi.security import OAuth2PasswordRequestForm
from core.security import verify_password, create_access_token
from datetime import timedelta

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/api/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
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
```