import json
from uuid import UUID

from kafka import KafkaConsumer
from sqlalchemy.orm import Session

from core.db import SessionLocal
from models.task_event import TaskEvent

def get_db():
    """Функция для получения сессии БД, как в FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def process_event(event: dict, db: Session):
    """
    Обрабатывает одно событие и сохраняет его в БД.
    """
    event_type = event.get("event_type")
    data = event.get("data")

    if not event_type or not data:
        print("Received malformed event")
        return

    print(f"\n--- Processing Event: {event_type} ---")

    if event_type == 'TASK_CREATED':
        task_id_str = data.get('id')
        user_id_str = data.get('user_id')
        task_text = data.get('text')

        if not task_id_str or not user_id_str:
            print(f"Skipping event with incomplete data: {data}")
            return

        task_event = TaskEvent(
            id=f"{event_type}_{task_id_str}",
            event_type=event_type,
            task_id=UUID(task_id_str),
            task_text=data.get('text'),
            task_owner_id=UUID(user_id_str)
        )

        db.add(task_event)
        db.commit()
        print(f"Saved event for task ID: {task_id_str}, task text: {task_text}")

    # Здесь в будущем можно будет добавить обработку других типов событий
    # elif event_type == 'TASK_DELETED':
    #     ...

def main():
    """
    Основная функция, которая запускает консьюмер.
    """
    consumer = KafkaConsumer(
        'task_events',
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='analytics-group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    print("Analytics service is listening for messages on 'task_events' topic...")
    
    db_session_gen = get_db()
    
    for message in consumer:
        event = message.value
        with SessionLocal() as db:
            try:
                process_event(event, db)
            except Exception as e:
                print(f"Error processing event: {e}")

if __name__ == "__main__":
    main()