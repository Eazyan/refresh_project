import json
from kafka import KafkaConsumer

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
    print("\n--- New Event Received ---")
    print(f"Event Type: {event.get('event_type')}")
    print("Data:")
    print(json.dumps(event.get('data'), indent=2, ensure_ascii=False))
    print("------------------------")