# Урок 6.1: Основы Apache Kafka с Python — Итоги

## Что мы изучили и реализовали:

1.  **Концепция Event-Driven Architecture**: Мы познакомились с событийно-ориентированным подходом, где компоненты системы общаются не напрямую, а через отправку событий в центральный брокер сообщений. Это делает систему более гибкой, масштабируемой и отказоустойчивой.
2.  **Развертывание Kafka**: Мы расширили наш `docker-compose.yml`, добавив в него сервисы `zookeeper` (координатор) и `kafka` (брокер сообщений), используя готовые образы от Confluent.
3.  **Kafka Producer**: Мы создали "продюсера" — компонент, ответственный за отправку сообщений в Kafka.
    *   Установили библиотеку `kafka-python`.
    *   Создали модуль `core/kafka_producer.py`, инкапсулирующий логику подключения и отправки.
    *   Настроили `value_serializer` для автоматического преобразования словарей Python в JSON-строки, переиспользовав наш `UUIDEncoder`.
4.  **Отправка событий**: Мы интегрировали продюсера в наше приложение. Теперь при создании новой задачи (`POST /api/tasks`) наш API-сервис не только сохраняет данные в PostgreSQL и инвалидирует кэш в Redis, но и отправляет событие `TASK_CREATED` в топик Kafka `task_events`.

## Ключевые выводы и важные замечания:

### 1. Kafka как "Журнал событий"

Важно понимать, что Kafka — это не просто очередь сообщений. Это распределенный, отказоустойчивый **лог (журнал)**. События в нем не удаляются сразу после прочтения. Они хранятся в топиках определенное время, и их могут читать множество разных "потребителей" (consumers) независимо друг от друга. Один может читать для аналитики, другой — для отправки уведомлений, третий — для обновления поискового индекса.

### 2. Развязка (Decoupling) сервисов

Наш API-сервис теперь ничего не знает и не должен знать о том, кто и как будет использовать информацию о создании задачи. Он просто выполнил свою обязанность — сообщил о факте в центральную систему. Это и есть главный плюс событийно-ориентированной архитектуры. Мы можем добавлять новые микросервисы-слушатели, абсолютно не изменяя код нашего основного API.

### 3. Сериализация — это ключ

Мы снова столкнулись с необходимостью сериализации данных (преобразования объектов в строки/байты). Это фундаментальная концепция в распределенных системах. Будь то Redis или Kafka, данные перед отправкой по сети должны быть представлены в универсальном формате, таком как JSON.

---

## Финальный код урока:

### `docker-compose.yml` (добавленные сервисы)
```yaml
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.0.1
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

### `core/kafka_producer.py`
```python
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
    try:
        message = {
            "event_type": event_type,
            "data": task_data
        }
        producer.send('task_events', value=message)
        print(f"Sent event '{event_type}' to Kafka topic 'task_events'")
    except Exception as e:
        print(f"Error sending event to Kafka: {e}")
```

### `main.py` (фрагмент эндпоинта `create_task`)
```python
from core.kafka_producer import send_task_event

@app.post("/api/tasks", ...)
def create_task(...):
    # ... логика создания задачи в БД ...
    
    # ... инвалидация кэша Redis ...
    
    task_dict = TaskResponse.model_validate(new_task_db).model_dump()
    send_task_event('TASK_CREATED', task_dict)
    
    return new_task_db
```
