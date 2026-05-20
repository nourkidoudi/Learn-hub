import json
import jwt as pyjwt
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")

def get_user_id(request: Request) -> Optional[str]:
    """Extract user_id from JWT Bearer token, return None if missing/invalid."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("id") or payload.get("sub")
    except Exception:
        return None

def require_user(request: Request) -> str:
    user_id = get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id

# ─── COURSES ────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.CourseOut])
def get_courses(db: Session = Depends(database.get_db)):
    try:
        cached = database.redis_client.get("courses_all")
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    courses = db.query(models.Course).filter(models.Course.is_published == True).all()
    return courses

@router.get("/instructor/me", response_model=List[schemas.CourseOut])
def get_my_courses(request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    courses = db.query(models.Course).filter(models.Course.instructor_id == user_id).all()
    return courses

@router.post("/", response_model=schemas.CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(course: schemas.CourseCreate, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    new_course = models.Course(**course.model_dump(), instructor_id=user_id)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    try:
        database.redis_client.delete("courses_all")
    except Exception:
        pass
    return new_course

@router.get("/enrollments/me", response_model=List[schemas.EnrollmentOut])
def get_my_enrollments(request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id).all()
    return enrollments

@router.get("/instructor/enrollments", response_model=List[schemas.EnrollmentOut])
def get_instructor_enrollments(request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    print(f"DEBUG: Fetching enrollments for instructor {user_id}")
    # Join Enrollment with Course to filter by instructor_id
    enrollments = db.query(models.Enrollment).join(models.Course).filter(
        models.Course.instructor_id == user_id
    ).all()
    print(f"DEBUG: Found {len(enrollments)} enrollments")
    return enrollments

@router.get("/{id}", response_model=schemas.CourseOut)
def get_course(id: str, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{id}", response_model=schemas.CourseOut)
def update_course(id: str, data: schemas.CourseUpdate, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    try:
        database.redis_client.delete("courses_all")
    except Exception:
        pass
    return course

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(id: str, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(course)
    db.commit()

# ─── ENROLLMENTS ────────────────────────────────────────────────────────────

@router.get("/{id}/enrollment", response_model=schemas.EnrollmentCheck)
def check_enrollment(id: str, request: Request, db: Session = Depends(database.get_db)):
    user_id = get_user_id(request)
    if not user_id:
        return {"enrolled": False}
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == id,
        models.Enrollment.user_id == user_id
    ).first()
    if enrollment:
        return {"enrolled": True, "id": enrollment.id}
    return {"enrolled": False}

@router.post("/{id}/enroll", response_model=schemas.EnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll_in_course(id: str, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == id,
        models.Enrollment.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled in this course")
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    enrollment = models.Enrollment(course_id=id, user_id=user_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.put("/enrollments/{enrollment_id}", response_model=schemas.EnrollmentOut)
def update_enrollment(enrollment_id: str, data: schemas.EnrollmentUpdate, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.id == enrollment_id,
        models.Enrollment.user_id == user_id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(enrollment, key, value)
    db.commit()
    db.refresh(enrollment)
    return enrollment

# ─── REVIEWS ────────────────────────────────────────────────────────────────

@router.get("/{id}/reviews", response_model=List[schemas.ReviewOut])
def get_reviews(id: str, db: Session = Depends(database.get_db)):
    return db.query(models.Review).filter(models.Review.course_id == id).all()

@router.get("/{id}/my-review", response_model=Optional[schemas.ReviewOut])
def get_my_review(id: str, request: Request, db: Session = Depends(database.get_db)):
    user_id = get_user_id(request)
    if not user_id:
        return None
    return db.query(models.Review).filter(
        models.Review.course_id == id,
        models.Review.user_id == user_id
    ).first()

@router.post("/{id}/reviews", response_model=schemas.ReviewOut, status_code=status.HTTP_201_CREATED)
def submit_review(id: str, data: schemas.ReviewCreate, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    existing = db.query(models.Review).filter(
        models.Review.course_id == id,
        models.Review.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You already reviewed this course")
    review = models.Review(course_id=id, user_id=user_id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.put("/reviews/{review_id}", response_model=schemas.ReviewOut)
def update_review(review_id: str, data: schemas.ReviewUpdate, request: Request, db: Session = Depends(database.get_db)):
    user_id = require_user(request)
    review = db.query(models.Review).filter(
        models.Review.id == review_id,
        models.Review.user_id == user_id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(review, key, value)
    db.commit()
    db.refresh(review)
    return review
