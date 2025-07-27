import asyncio
import json
from pydoc import importfile
from uuid import UUID

from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaConnectionError
from sqlalchemy.orm import Session

from core.db import SessionLocal
from models.task_event import TaskEvent


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
            task_user_id=UUID(user_id_str)
        )

        db.add(task_event)
        db.commit()
        print(f"Saved event for task ID: {task_id_str}, task text: {task_text}")

    # Здесь в будущем можно будет добавить обработку других типов событий
    # elif event_type == 'TASK_DELETED':
    #     ...

async def consume_events():
    consumer = AIOKafkaConsumer(
        'task_events',
        bootstrap_servers='kafka:9092',
        group_id="analytics-group",
        value_deserializer=lambda x: json.loads(x.decode('utf-8')),
        retry_backoff_ms=2000
    )
    for _ in range(5):
        try:
            await consumer.start()
            print("Kafka Consumer started and listening...")
            break
        except KafkaConnectionError:
            print("Kafka not available for consumer, retrying in 5s...")
            await asyncio.sleep(5)
    else:
        raise Exception("Could not connect consumer to Kafka")

    try:
        async for msg in consumer:
            event = msg.value
            with SessionLocal() as db:
                try:
                    process_event(event, db)
                except Exception as e:
                    print(f"Error processing event: {e}")
    finally:
        await consumer.stop()