#!/usr/bin/env python3
"""
Seed script - insert sample courses directly into PostgreSQL.
Run with: docker exec -it <postgres-container> psql -U postgres -d courses -f /tmp/seed.sql
Or run this Python script after connecting to the course-service container.
"""
import os, sys
sys.path.insert(0, "/app")

from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Check if already seeded
if db.query(models.Course).count() > 0:
    print("Database already seeded.")
    db.close()
    sys.exit(0)

courses = [
    {
        "title": "Complete DevOps Bootcamp",
        "description": "Master Docker, Kubernetes, CI/CD pipelines, and cloud infrastructure from scratch.",
        "category": "DevOps",
        "level": "Beginner",
        "price": 0.0,
        "image_url": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800",
        "instructor_id": "seed-instructor-1",
        "duration_hours": 24.0,
        "is_published": True,
    },
    {
        "title": "React & TypeScript Masterclass",
        "description": "Build production-ready web apps with React 18, TypeScript, and modern patterns.",
        "category": "Web Development",
        "level": "Intermediate",
        "price": 29.99,
        "original_price": 59.99,
        "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        "instructor_id": "seed-instructor-1",
        "duration_hours": 18.0,
        "is_published": True,
    },
    {
        "title": "Python for Data Science",
        "description": "Learn pandas, NumPy, matplotlib, and scikit-learn with hands-on projects.",
        "category": "Data Science",
        "level": "Beginner",
        "price": 0.0,
        "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
        "instructor_id": "seed-instructor-2",
        "duration_hours": 15.0,
        "is_published": True,
    },
    {
        "title": "AWS Cloud Architecture",
        "description": "Design scalable, highly available architectures on AWS. Prepare for the Solutions Architect exam.",
        "category": "Cloud",
        "level": "Advanced",
        "price": 49.99,
        "original_price": 99.99,
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        "instructor_id": "seed-instructor-2",
        "duration_hours": 30.0,
        "is_published": True,
    },
    {
        "title": "Machine Learning with Python",
        "description": "From linear regression to deep neural networks. Build real AI models step by step.",
        "category": "AI & ML",
        "level": "Intermediate",
        "price": 39.99,
        "original_price": 79.99,
        "image_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800",
        "instructor_id": "seed-instructor-1",
        "duration_hours": 22.0,
        "is_published": True,
    },
    {
        "title": "Kubernetes & Container Orchestration",
        "description": "Deploy, scale, and manage containerized applications with Kubernetes in production.",
        "category": "DevOps",
        "level": "Advanced",
        "price": 0.0,
        "image_url": "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800",
        "instructor_id": "seed-instructor-2",
        "duration_hours": 20.0,
        "is_published": True,
    },
]

for c in courses:
    course = models.Course(**c)
    db.add(course)

db.commit()
print(f"✅ Seeded {len(courses)} courses successfully.")
db.close()
