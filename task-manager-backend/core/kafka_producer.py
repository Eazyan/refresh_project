import asyncio
import json
from uuid import UUID

from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaConnectionError

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

producer: AIOKafkaProducer | None = None

async def get_kafka_producer():
    return producer

async def startup_kafka_producer():
    global producer
    print("Starting Kafka producer...")
    producer = AIOKafkaProducer(
        bootstrap_servers='kafka:9092',
        value_serializer=lambda v: json.dumps(v, cls=UUIDEncoder).encode('utf-8'),
        retry_backoff_ms=2000,
        request_timeout_ms=30000,
        linger_ms=100,
        max_batch_size=16384*4
    )
    for _ in range(5): # 5 попыток
        try:
            await producer.start()
            print("Kafka producer started.")
            return
        except KafkaConnectionError:
            print("Kafka not available, retrying in 5 seconds...")
            await asyncio.sleep(5)
    raise Exception("Could not connect to Kafka")

async def shutdown_kafka_producer():
    global producer
    if producer:
        print("Stopping Kafka producer...")
        await producer.stop()
        print("Kafka producer stopped.")

async def send_task_event(event_type: str, task_data: dict):
    kafka_producer = await get_kafka_producer()
    if kafka_producer:
        await kafka_producer.send_and_wait('task_events', value={"event_type": event_type, "data": task_data})
        print(f"Sent event '{event_type}' to Kafka")