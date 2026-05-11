# Dockerfile (at root level)
FROM node:20-alpine as frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim as backend

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock* ./
RUN pip install uv && uv sync
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./static

RUN git config --global http.sslVerify false
RUN uv sync

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]