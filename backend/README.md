# Backend

基于 FastAPI 的交通系统后端，负责：

- 用户注册、登录、用户名修改、密码修改
- JWT 鉴权与当前用户解析
- 交通模拟数据生成
- HTTP 数据接口
- WebSocket 实时推送

## 目录结构

- `app/main.py`: 应用入口
- `app/api/routes/`: 路由层
- `app/auth/`: 认证逻辑
- `app/core/`: 基础设施
- `app/dependencies/`: 依赖注入
- `app/services/`: 业务服务
- `app/config.py`: 环境配置
- `app/database.py`: 数据库连接
- `app/crud.py`: 用户数据操作

## 启动

先在项目根目录准备 `.env`，确保至少包含：

```bash
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/TRANSIPORT
JWT_SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

然后启动：

```bash
cd backend
uv run uvicorn app.main:app --reload
```

如果不用 `uv`，也可以自行创建 Python 3.12 虚拟环境后通过 `pip` 安装依赖，再运行 `uvicorn app.main:app --reload`。
