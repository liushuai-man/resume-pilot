# 生产部署（ECS）

本项目的生产 Compose 只对公网暴露 80 端口；数据库、Redis 和后端 API 均在 Docker 内网中运行。

## 首次部署

1. 在 ECS 安装 Docker Engine 与 Docker Compose Plugin。
2. 复制 `.env.production.example` 为 `.env.production`，填入强随机密码、GitHub OAuth 回调地址和加密密钥。不要提交该文件。
3. 执行 `docker compose build`，再执行 `docker compose up -d`。
4. 执行 `docker compose exec backend pnpm prisma migrate deploy`。
5. 用 `curl http://127.0.0.1/health` 检查后端健康状态；浏览器访问服务器公网 IP。

## 上线前检查

- 安全组仅开放 TCP 80；SSH 22 仅允许管理员固定 IP。数据库 5432、Redis 6379、Node 4000 均不开放公网。
- HTTPS 与域名准备好后，将 Nginx 的 443 证书配置加入 `docker/nginx.conf`，并把 `FRONTEND_URL`、`CORS_ORIGIN` 与 GitHub 回调统一改为 HTTPS 域名。
- `MODEL_CONFIG_ENCRYPTION_KEY` 必须固定保存。丢失后已保存的用户模型 Key 无法解密。
- 上传文件在 `uploads_data` Docker volume；升级前备份该 volume 与 PostgreSQL 数据。
- 建议限制受邀 HR 数量。2 核 2G ECS 只适合低并发体验，PDF/OCR 操作请串行进行。
