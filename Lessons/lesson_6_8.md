# Урок 6.8: Утилиты и генерация отчетов в Python-сервисе — Итоги

## Что мы изучили и реализовали:

1.  **Комбинированный микросервис**: Мы создали сложный микросервис, который одновременно выполняет две роли:
    *   **Kafka Consumer**: В фоновом режиме асинхронно слушает и обрабатывает события из Kafka.
    *   **API Server**: Запускает веб-сервер FastAPI для ответа на HTTP-запросы.
2.  **Генерация Excel-отчетов**: Мы научились генерировать файлы "на лету" в памяти, не сохраняя их на диск.
    *   Использовали библиотеку **`pandas`** для удобной загрузки данных из базы SQLite (`pd.read_sql`).
    *   Использовали **`xlsxwriter`** как "движок" для `pandas` для создания `.xlsx` файла.
    *   Применили **`io.BytesIO`** для создания виртуального файла в оперативной памяти.
3.  **Отправка файлов через FastAPI**: Мы научились отдавать сгенерированные файлы пользователю, используя специальный `StreamingResponse` и `Content-Disposition` заголовок, который заставляет браузер скачивать файл.
4.  **Асинхронные фоновые задачи**: Мы освоили канонический способ запуска долгоживущих асинхронных задач (как наш Kafka-консьюмер) внутри FastAPI-приложения с помощью `asyncio.create_task` в обработчике событий `@app.on_event("startup")`.
5.  **Отладка сложных зависимостей**: Мы столкнулись с проблемами несовместимости библиотеки `kafka-python` и перешли на более современные и надежные асинхронные клиенты (`aiokafka`), получив опыт миграции между библиотеками.

## Ключевые выводы и важные замечания:

### 1. `asyncio.create_task` vs `threading`

Мы на практике убедились, что для запуска асинхронной задачи внутри асинхронного приложения (как FastAPI/Uvicorn) правильным инструментом является `asyncio`, а не `threading`. `asyncio.create_task` позволяет фоновой задаче работать в том же цикле событий (event loop), что и основное приложение, что гораздо эффективнее и проще в управлении.

### 2. Pandas как швейцарский нож для данных

Этот урок продемонстрировал мощь `pandas`. Одной строкой (`pd.read_sql`) мы загрузили данные, другой (`df.to_excel`) — сохранили их в сложном формате. Эта библиотека является стандартом де-факто в Python для любых задач, связанных с обработкой и анализом табличных данных.

### 3. Разделение сервисов по портам

При переходе к микросервисной архитектуре мы столкнулись с необходимостью запускать сервисы на разных портах (`8000` для основного API, `8001` для аналитического), что является стандартной практикой.

---

## Финальный код урока:

### `analytics-service/core/reporting.py`
```python
import pandas as pd
from sqlalchemy.orm import Session
from io import BytesIO

def generate_tasks_report(db: Session) -> BytesIO:
    query = "SELECT event_type, task_id, task_text, task_owner_id, created_at FROM task_events"
    df = pd.read_sql(query, db.bind)

    output = BytesIO()

    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Task Events')
        worksheet = writer.sheets['Task Events']
        worksheet.autofit()

    output.seek(0)
    return output
```

### `analytics-service/consumer.py` (финальная асинхронная версия)
```python
import asyncio
import json
from aiokafka import AIOKafkaConsumer
from sqlalchemy.orm import Session
from uuid import UUID

from core.db import SessionLocal
from models.task_event import TaskEvent

def process_event(event: dict, db: Session):
    # ... логика обработки и сохранения события ...

async def consume_events():
    consumer = AIOKafkaConsumer(
        'task_events',
        bootstrap_servers='localhost:9092',
        group_id="analytics-group",
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    await consumer.start()
    print("Kafka Consumer started and listening...")
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
```

### `analytics-service/main.py` (финальная версия)
```python
import asyncio
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.db import get_db, engine, Base
from core.reporting import generate_tasks_report
from consumer import consume_events

Base.metadata.create_all(bind=engine)
app = FastAPI()
consumer_task = None

@app.on_event("startup")
async def startup_event():
    global consumer_task
    print("FastAPI startup: Starting Kafka consumer in background...")
    consumer_task = asyncio.create_task(consume_events())

@app.on_event("shutdown")
async def shutdown_event():
    if consumer_task:
        print("FastAPI shutdown: Stopping Kafka consumer...")
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            print("Kafka consumer task cancelled.")

@app.get("/api/reports/tasks", tags=["Reports"])
def get_tasks_report(db: Session = Depends(get_db)):
    report_file = generate_tasks_report(db)
    headers = {'Content-Disposition': 'attachment; filename="tasks_report.xlsx"'}
    return StreamingResponse(
        report_file, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )
```