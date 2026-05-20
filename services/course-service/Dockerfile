FROM python:3.11

WORKDIR /app

# Plus besoin de apt-get install car l'image 'python:3.11' (non-slim) 
# contient déjà gcc et les outils de développement par défaut.

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
