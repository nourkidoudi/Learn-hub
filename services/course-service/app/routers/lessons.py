import os
import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")

def get_user_id(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        payload = pyjwt.decode(auth.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
        return payload.get("id") or payload.get("sub")
    except Exception:
        return None

@router.get("/course/{course_id}", response_model=List[schemas.LessonOut])
def get_lessons_for_course(course_id: str, db: Session = Depends(database.get_db)):
    return db.query(models.Lesson).filter(
        models.Lesson.course_id == course_id
    ).order_by(models.Lesson.order_index).all()

@router.post("/course/{course_id}", response_model=schemas.LessonOut, status_code=status.HTTP_201_CREATED)
def create_lesson(course_id: str, lesson: schemas.LessonCreate, request: Request, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    new_lesson = models.Lesson(**lesson.model_dump(), course_id=course_id)
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.put("/{lesson_id}", response_model=schemas.LessonOut)
def update_lesson(lesson_id: str, data: schemas.LessonUpdate, request: Request, db: Session = Depends(database.get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(lesson, key, value)
    db.commit()
    db.refresh(lesson)
    return lesson

@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: str, request: Request, db: Session = Depends(database.get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
