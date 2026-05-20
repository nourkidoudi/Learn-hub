FROM python:3.11

WORKDIR /app

# L'image full python:3.11 inclut déjà les compilateurs nécessaires
# ce qui évite les erreurs de connexion deb.debian.org

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
