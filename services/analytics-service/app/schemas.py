from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PageViewCreate(BaseModel):
    user_id: Optional[str] = None
    page_url: str

class EventCreate(BaseModel):
    user_id: str
    event_type: str
    entity_id: Optional[str] = None

class DashboardMetrics(BaseModel):
    total_enrollments: int
    total_views: int
    active_users: int
