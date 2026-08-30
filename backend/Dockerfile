FROM python:3.12-slim

WORKDIR /app

COPY requirements-docker.txt .

# CPU-only PyTorch
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.13.0

# Remaining dependencies
RUN pip install --no-cache-dir -r requirements-docker.txt

COPY app ./app

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]