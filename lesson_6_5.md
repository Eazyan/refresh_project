# Урок 6.5: Интеграция БД в микросервис-потребитель — Итоги

## Что мы изучили и реализовали:

1.  **Паттерн "База данных на сервис"**: Мы реализовали один из фундаментальных принципов микросервисной архитектуры, выделив для нашего `analytics-service` собственную, независимую базу данных (SQLite).
2.  **Настройка SQLAlchemy и Alembic для нового сервиса**: Мы повторили и закрепили весь процесс настройки инфраструктуры для работы с базой данных: инициализация, конфигурация, создание моделей и применение миграций.
3.  **Логика сохранения данных в консьюмере**: Наш сервис-потребитель перестал быть "пассивным слушателем". Теперь он выполняет бизнес-логику: парсит входящие события и сохраняет их в свою базу данных.
4.  **Отладка типичных проблем**: Мы столкнулись с несколькими реальными проблемами и успешно их решили:
    *   **Проблема сериализации (`AttributeError: 'str' object has no attribute 'hex'`)**: Научились вручную преобразовывать строковые `UUID` из событий в объекты `UUID` для корректной работы с SQLAlchemy и драйвером SQLite.
    *   **Проблема неполных данных (`ValueError: ... must be given`)**: Улучшили код, добавив проверки на `None`, чтобы сделать консьюмер более устойчивым к неполным или некорректным событиям.
    *   **Проблема управления сессиями (`StopIteration`)**: Разобрались с жизненным циклом генераторов в Python и перешли на более надежный паттерн `with SessionLocal() as db:`, который обеспечивает создание новой сессии для обработки каждого отдельного сообщения.

## Ключевые выводы и важные замечания:

### 1. Отказоустойчивость консьюмера

В реальном мире консьюмер — это долгоживущий процесс, который должен работать 24/7. Наш финальный код с `with SessionLocal() as db:` и блоком `try...except` внутри цикла — это пример отказоустойчивого дизайна. Если обработка одного сообщения по какой-то причине вызовет ошибку, наш сервис не "упадет", а просто залогирует ошибку и перейдет к следующему сообщению.

### 2. Eventual Consistency (Согласованность в конечном счете)

Мы на практике увидели, что такое "согласованность в конечном счете". Когда пользователь создает задачу, она мгновенно появляется в основной базе PostgreSQL. А в аналитической базе SQLite она появляется с небольшой задержкой (доли секунды), после того как событие пройдет через Kafka и будет обработано. Для аналитики такая задержка абсолютно приемлема. Этот компромисс позволяет нам строить слабосвязанные и масштабируемые системы.

### 3. Чистота кода

Мы отрефакторили наш `consumer.py`, вынеся логику обработки в отдельную функцию `process_event`, а основную логику запуска — в `main()`. Это делает код более читаемым и структурированным.

---

## Финальный код урока:

### `analytics-service/consumer.py`
```python
import json
from kafka import KafkaConsumer
from sqlalchemy.orm import Session
from uuid import UUID

from core.db import SessionLocal
from models.task_event import TaskEvent

def process_event(event: dict, db: Session):
    event_type = event.get("event_type")
    data = event.get("data")

    if not event_type or not data:
        print("Received malformed event")
        return

    print(f"\n--- Processing Event: {event_type} ---")
    
    if event_type == 'TASK_CREATED':
        task_id_str = data.get('id')
        owner_id_str = data.get('owner_id')

        if not task_id_str or not owner_id_str:
            print(f"Skipping event with incomplete data: {data}")
            return
            
        task_event = TaskEvent(
            id=f"{event_type}_{task_id_str}",
            event_type=event_type,
            task_id=UUID(task_id_str),
            task_text=data.get('text'),
            task_owner_id=UUID(owner_id_str)
        )
        db.add(task_event)
        db.commit()
        print(f"Saved event for task ID: {task_id_str}")

def main():
    consumer = KafkaConsumer(
        'task_events',
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='analytics-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    print("Analytics service is listening for messages on 'task_events' topic...")
    
    for message in consumer:
        event = message.value
        
        with SessionLocal() as db:
            try:
                process_event(event, db)
            except Exception as e:
                print(f"Error processing event: {e}")
    
if __name__ == "__main__":
    main()
```