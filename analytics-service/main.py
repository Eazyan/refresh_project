import asyncio
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from consumer import consume_events
from core.db import Base, engine, get_db
from core.reporting import generate_tasks_report

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Analytics service startup: Starting Kafka consumer...")
    consumer_task = asyncio.create_task(consume_events())
    
    yield
    
    print("Analytics service shutdown: Stopping Kafka consumer...")
    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        print("Kafka consumer task cancelled successfully.")

app = FastAPI(lifespan=lifespan)

consumer_task = None

@app.get("/api/reports/tasks", tags=["Reports"])
def get_tasks_report(db: Session = Depends(get_db)):
    report_file = generate_tasks_report(db)
    
    headers = {
        'Content-Disposition': 'attachment; filename="tasks_report.xlsx"'
    }
    
    return StreamingResponse(
        report_file, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )