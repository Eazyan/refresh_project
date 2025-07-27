# Урок 5.1: Кэширование с Redis — Итоги

## Что мы изучили и реализовали:

1.  **Развертывание Redis**: Мы добавили Redis как еще один сервис в наш `docker-compose.yml`, научившись управлять несколькими связанными сервисами (PostgreSQL + Redis).
2.  **Подключение к Redis**: Установили Python-библиотеку `redis` и создали `core/redis_client.py` — модуль-клиент для инкапсуляции всей логики работы с Redis (подключение, сериализация, десериализация).
3.  **Сериализация данных**: Мы столкнулись с реальной проблемой `TypeError: Object of type UUID is not JSON serializable` и решили ее, создав кастомный `json.JSONEncoder` для правильного преобразования `UUID` в строку.
4.  **Паттерн "Cache-Aside"**: Мы реализовали одну из самых популярных стратегий кэширования:
    *   **Cache Hit**: При запросе данных сначала проверяем их наличие в Redis. Если данные найдены, мгновенно возвращаем их, избегая обращения к медленной базе данных.
    *   **Cache Miss**: Если данных в кэше нет, делаем запрос к основной базе (PostgreSQL), а затем **сохраняем** полученный результат в Redis с установленным TTL (временем жизни), чтобы последующие запросы получили Cache Hit.
5.  **Инвалидация кэша**: Мы реализовали критически важную часть стратегии — принудительную очистку кэша при любом изменении данных (`POST` и `DELETE` запросы). Это гарантирует, что пользователи не будут получать устаревшие (stale) данные.

## Ключевые выводы и важные замечания:

### 1. Кэш — это компромисс

Кэширование — это мощный инструмент для повышения производительности, но он вводит дополнительную сложность в систему. Главная проблема, как мы увидели, — это **синхронизация кэша с основным хранилищем**. Неправильная или забытая инвалидация кэша является источником множества трудноуловимых багов в реальных приложениях.

### 2. Уникальность ключей кэша

В многопользовательском приложении критически важно формировать ключи для кэша так, чтобы они были уникальны для каждого пользователя (например, `f"tasks_for_user_{current_user.id}"`). В противном случае возникает риск утечки данных, когда один пользователь может увидеть кэшированные данные другого.

### 3. Время жизни (TTL)

Мы установили TTL в 5 минут (`300` секунд). Это "страховка". Даже если по какой-то причине инвалидация не сработает, кэш автоматически очистится через 5 минут, и система вернется в консистентное состояние. Выбор правильного TTL — это всегда баланс между производительностью (чем дольше живет кэш, тем лучше) и актуальностью данных.

---

## Финальный код урока:

### `docker-compose.yml` (добавленный сервис)
```yaml
  redis:
    image: redis:7
    container_name: task-manager-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### `core/redis_client.py`
```python
import redis
import json
from uuid import UUID

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def set_cache(key: str, value: any, ttl: int = 300):
    redis_client.setex(key, ttl, json.dumps(value, cls=UUIDEncoder))

def get_cache(key: str) -> any:
    value = redis_client.get(key)
    if value:
        return json.loads(value)
    return None

def invalidate_cache(key: str):
    redis_client.delete(key)
```

### `main.py` (фрагменты с логикой кэширования)
```python
from core.redis_client import get_cache, set_cache, invalidate_cache

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cache_key = f"tasks_for_user_{current_user.id}"
    cached_tasks = get_cache(cache_key)
    
    if cached_tasks is not None:
        return [TaskResponse.model_validate(task) for task in cached_tasks]

    tasks = db.query(Task).filter(Task.owner_id == current_user.id).all()
    
    tasks_to_cache = [TaskResponse.model_validate(task).model_dump() for task in tasks]
    set_cache(cache_key, tasks_to_cache)
    
    return tasks

@app.post("/api/tasks", ...)
def create_task(...):
    # ... логика создания задачи ...
    cache_key = f"tasks_for_user_{current_user.id}"
    invalidate_cache(cache_key)
    return new_task_db

@app.delete("/api/tasks/{task_id}", ...)
def delete_task(...):
    # ... логика удаления задачи ...
    cache_key = f"tasks_for_user_{current_user.id}"
    invalidate_cache(cache_key)
    return Response(...)
```