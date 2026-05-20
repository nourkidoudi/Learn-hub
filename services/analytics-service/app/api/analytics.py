from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas, database

router = APIRouter()

@router.post("/view", status_code=201)
def track_page_view(view: schemas.PageViewCreate, db: Session = Depends(database.get_db)):
    new_view = models.PageView(**view.model_dump())
    db.add(new_view)
    db.commit()
    return {"status": "success"}

@router.post("/event", status_code=201)
def track_event(event: schemas.EventCreate, db: Session = Depends(database.get_db)):
    new_event = models.Event(**event.model_dump())
    db.add(new_event)
    db.commit()
    return {"status": "success"}

@router.get("/dashboard", response_model=schemas.DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(database.get_db)):
    # Calculate simple metrics
    total_views = db.query(models.PageView).count()
    total_enrollments = db.query(models.Event).filter(models.Event.event_type == "enrollment").count()
    active_users = db.query(models.Event.user_id).distinct().count()

    return schemas.DashboardMetrics(
        total_enrollments=total_enrollments,
        total_views=total_views,
        active_users=active_users
    )
