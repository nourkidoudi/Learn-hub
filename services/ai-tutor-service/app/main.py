from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import chat

app = FastAPI(title="LearnHub AI Tutor Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/chat", tags=["Tutor Chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Tutor Service"}
