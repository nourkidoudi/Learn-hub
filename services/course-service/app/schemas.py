from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Lesson Schemas ---
class LessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: str
    content_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: int
    is_free_preview: Optional[bool] = False

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_type: Optional[str] = None
    content_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: Optional[int] = None
    is_free_preview: Optional[bool] = None

class LessonOut(LessonBase):
    id: str
    course_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    level: str
    price: float
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    duration_hours: Optional[float] = None
    is_published: Optional[bool] = False

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    duration_hours: Optional[float] = None
    is_published: Optional[bool] = None

class CourseOut(CourseBase):
    id: str
    instructor_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    lessons: List[LessonOut] = []

    class Config:
        from_attributes = True

# --- Enrollment Schemas ---
class EnrollmentOut(BaseModel):
    id: str
    course_id: str
    user_id: str
    progress: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EnrollmentCheck(BaseModel):
    enrolled: bool
    id: Optional[str] = None

class EnrollmentUpdate(BaseModel):
    progress: Optional[float] = None
    completed_at: Optional[datetime] = None

# --- Review Schemas ---
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: str
    course_id: str
    user_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
