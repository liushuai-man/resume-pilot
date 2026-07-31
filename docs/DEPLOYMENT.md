# 生产部署（ECS）

生产环境通过 Docker Compose 运行前端、后端、PostgreSQL 和 Redis。只有前端 HTTP
端口需要对公网开放，数据库、Redis 和后端 API 仅在 Docker 内网中通信。

## 首次部署

1. 在 ECS 安装 Docker Engine 和 Docker Compose Plugin。
2. 将 `.env.production.example` 复制为 `.env.production`，填写强随机密码、模型配置
   加密密钥和 OAuth 配置。不要提交 `.env.production`。
3. 如果宿主机的 80 端口已被其他服务占用，将 `APP_PORT` 改为其他端口，例如
   `APP_PORT=8081`，并在所有公网 URL 中包含该端口。
4. 构建并启动：

   ```bash
   docker compose --env-file .env.production build
   docker compose --env-file .env.production up -d
   ```

5. 初始化数据库和简历模板：

   ```bash
   docker compose --env-file .env.production exec backend pnpm prisma migrate deploy
   docker compose --env-file .env.production exec backend pnpm init:templates
   ```

6. 检查容器和日志：

   ```bash
   docker compose --env-file .env.production ps
   docker compose --env-file .env.production logs --tail=100 backend
   ```

## 上线前检查

- 安全组开放 `APP_PORT` 对应的 TCP 端口；SSH 22 仅允许管理员 IP。
- 不要对公网开放 PostgreSQL 5432、Redis 6379 和后端 4000。
- `CORS_ORIGIN`、`FRONTEND_URL` 和 OAuth 回调地址必须与实际公网地址一致。
- `MODEL_CONFIG_ENCRYPTION_KEY` 必须固定保存，丢失后已保存的用户模型密钥无法解密。
- 上传文件位于 `uploads_data` Docker volume；升级前备份该 volume 和 PostgreSQL 数据。
- 2 核 2G ECS 建议配置至少 2GB Swap，并控制 PDF、OCR 和 AI 请求并发。
