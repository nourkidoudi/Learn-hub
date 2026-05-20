import os
import json
import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3") # can be changed to mistral

def get_system_prompt(course_context: str = None) -> str:
    context_str = f"The student is currently studying: {course_context}\n" if course_context else ""
    return f"""You are an AI Tutor for LearnHub, an online learning platform. Your role is to:
- Help students understand course concepts
- Answer questions about their learning materials
- Provide explanations in clear, beginner-friendly language
- Offer study tips and learning strategies
- Encourage students and keep them motivated

{context_str}
Keep responses concise but helpful. Use examples when explaining complex topics. If you don't know something specific about a course, be honest and offer general guidance instead."""

async def stream_ollama_chat(messages: list, course_context: str = None):
    system_prompt = get_system_prompt(course_context)
    
    # Format messages for Ollama API
    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        formatted_messages.append({"role": msg.role, "content": msg.content})

    payload = {
        "model": MODEL_NAME,
        "messages": formatted_messages,
        "stream": True
    }

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST", f"{OLLAMA_URL}/api/chat", json=payload, timeout=60.0) as response:
                if response.status_code != 200:
                    yield json.dumps({'error': 'Failed to connect to AI model'})
                    return

                async for chunk in response.aiter_lines():
                    if chunk:
                        try:
                            data = json.loads(chunk)
                            if "message" in data and "content" in data["message"]:
                                yield json.dumps({'content': data['message']['content']})
                        except json.JSONDecodeError:
                            continue
                yield "[DONE]"
        except httpx.RequestError as e:
            yield json.dumps({'error': f'Connection to Ollama failed: {str(e)}'})
