from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from ..schemas import ChatRequest
from ..services.llm import stream_ollama_chat

router = APIRouter()

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    if request.stream:
        return EventSourceResponse(stream_ollama_chat(request.messages, request.courseContext))
    else:
        return {"message": "Use streaming for chat responses"}
