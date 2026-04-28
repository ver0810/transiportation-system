# Transportation System

一个前后端分离的交通可视化与路线优化项目。

![Homepage](./docs/images/HomePage.png)

## 项目结构

- `frontend/`: 基于 React + TypeScript + Vite 的前端应用，包含登录注册、路线优化、交通流量分析等页面。
- `backend/`: 基于 FastAPI 的后端服务，提供用户接口、交通数据生成与 WebSocket 推送能力。

## 主要功能

- 用户注册、登录、用户名修改、密码修改
- 路线规划与路线优化展示
- 交通流量地图可视化
- 交通统计、趋势、预测、热点等数据展示
- WebSocket 实时数据推送

## 技术栈

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- AMap JS API

### Backend

- FastAPI
- SQLModel
- PyMySQL
- WebSocket

## 启动方式

### 环境变量

在项目根目录创建 `.env`，至少配置以下变量：

```bash
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/TRANSIPORT
JWT_SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_BASE_URL=ws://127.0.0.1:8000/ws
VITE_AMAP_KEY=replace-with-your-amap-key
VITE_AMAP_SECURITY_JS_CODE=replace-with-your-amap-security-code
```

可以直接参考根目录下的 `.env.example`。

### Docker Compose

如果使用 Docker Compose，先在根目录准备 `.env`，然后执行：

```bash
docker compose up --build
```

启动后：

- 前端页面：`http://localhost`
- 后端接口：`http://localhost:8000`
- MySQL：`localhost:3306`

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
uv run uvicorn app.main:app --reload
```

如果未使用 `uv`，也可以自行创建 Python 3.12 环境后通过 `pip` 安装依赖并启动。

## 说明

- 当前项目包含真实地图路线规划能力，也包含基于本地数据和规则生成的交通模拟数据。
- 运行前请确认本地数据库、地图 Key 和相关依赖已正确配置。
