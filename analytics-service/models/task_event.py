from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from core.db import Base

class TaskEvent(Base):
    __tablename__ = "task_events"

    id = Column(String, primary_key=True, index=True) # ID самого события
    event_type = Column(String, index=True)
    task_id = Column(UUID(as_uuid=True), index=True)
    task_text = Column(String)
    task_owner_id = Column(UUID(as_uuid=True), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())