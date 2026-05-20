from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
import uuid
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class PageView(Base):
    __tablename__ = "analytics_page_views"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True) # Anonymous if not logged in
    page_url = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Event(Base):
    __tablename__ = "analytics_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False) # e.g. "enrollment", "course_completed", "video_watched"
    entity_id = Column(String, nullable=True) # ID of course or lesson
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
