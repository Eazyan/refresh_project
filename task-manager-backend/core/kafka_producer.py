import json
from kafka import KafkaProducer
from uuid import UUID

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v, cls=UUIDEncoder).encode('utf-8')
)

def send_task_event(event_type: str, task_data: dict):
    """
    Отправляет событие, связанное с задачей, в топик Kafka.
    - event_type: Тип события (например, 'TASK_CREATED').
    - task_data: Данные задачи.
    """
    try:

        message = {
            "event_type": event_type,
            "data": task_data
        }

        producer.send('task_events', value=message)
        print(f"Sent event '{event_type}' to Kafka topic 'task_events'")
    except Exception as e:
        print(f"Error sending event to Kafka: {e}")