from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import courses, lessons

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LearnHub Course Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LearnHub Course Service"}
