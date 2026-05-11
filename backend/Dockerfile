FROM python:3.11-slim

WORKDIR /app

# Install Git and uv
RUN apt-get update && apt-get install -y git && \
    pip install uv && \
    rm -rf /var/lib/apt/lists/*

# Configure Git to skip SSL verification (for Docker builds)
RUN git config --global http.sslVerify false

# copy project files
COPY pyproject.toml uv.lock* ./
COPY . .

# install dependencies using uv
RUN uv sync

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]