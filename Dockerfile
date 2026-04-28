FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend ./

ARG VITE_API_BASE_URL=http://127.0.0.1:8000
ARG VITE_WS_BASE_URL=ws://127.0.0.1:8000/ws
ARG VITE_AMAP_KEY=dummy-key
ARG VITE_AMAP_SECURITY_JS_CODE=dummy-security-code

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}
ENV VITE_AMAP_KEY=${VITE_AMAP_KEY}
ENV VITE_AMAP_SECURITY_JS_CODE=${VITE_AMAP_SECURITY_JS_CODE}

RUN npm install
RUN npm run build


FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist
COPY docker/start.sh /app/docker/start.sh

RUN chmod +x /app/docker/start.sh

EXPOSE 80 8000

CMD ["/app/docker/start.sh"]
