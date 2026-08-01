# ResumePilot CI/CD

推送 `main` 分支后，GitHub Actions 会构建前后端镜像并推送至 GHCR，随后通过 SSH 连接 ECS，执行数据库迁移并更新容器。ECS 不再本地构建镜像。

## GitHub Secrets

在仓库的 `Settings -> Secrets and variables -> Actions` 中配置：

| Secret | 示例 | 说明 |
| --- | --- | --- |
| `ECS_HOST` | `120.55.2.225` | ECS 公网 IP |
| `ECS_PORT` | `22` | SSH 端口 |
| `ECS_USER` | `root` | 当前部署用户 |
| `ECS_SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH...` | 部署专用私钥完整内容 |

服务器必须保留 `/root/resume-pilot/.env.production`。流水线不会上传或覆盖该文件，也不会删除 PostgreSQL、Redis 和上传文件的数据卷。

## 首次启用

1. 将 CI/CD 文件提交并推送到 `main`。
2. 打开仓库的 `Actions` 页面，查看 `Build and deploy`。
3. 工作流也可以通过 `Run workflow` 手动执行。
4. 部署完成后访问 `http://120.55.2.225` 并检查主要功能。

工作流使用仓库自己的 `GITHUB_TOKEN` 登录 GHCR，不需要额外创建 PAT。镜像可以保持私有，ECS 每次发布时会获得本次任务的临时读取凭据。

## 服务器手动检查

CI/CD 使用独立生产 Compose 文件。需要手动查看时执行：

```bash
cd /root/resume-pilot
docker compose --env-file .env.production -f docker-compose.production.yml ps
docker compose --env-file .env.production -f docker-compose.production.yml logs --since=10m backend frontend
```

需要手动重新部署当前 GHCR 镜像时执行：

```bash
cd /root/resume-pilot
sh docker/deploy.sh
```

## 资源说明

镜像编译发生在 GitHub Actions，2 核 2G ECS 只执行镜像拉取、迁移和容器重建。建议继续保留已经创建的 2 GB Swap，并定期清理无用的旧镜像：

```bash
docker image prune -f
```
