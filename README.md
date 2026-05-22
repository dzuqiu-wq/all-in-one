# All-in-One Toolbox

> 一站式在线工具箱，提供文档转换、图片优化、二维码生成等功能。支持中英文切换。

**在线体验：** https://333654.xyz

## 功能特性

| 工具 | 类型 | 说明 |
|------|------|------|
| Word 转 PDF | 服务端 | 支持 .doc/.docx 转换为 PDF |
| Excel 转 PDF | 服务端 | 支持 .xls/.xlsx 转换为 PDF |
| PPT 转 PDF | 服务端 | 支持 .ppt/.pptx 转换为 PDF |
| PDF 合并/拆分 | 客户端 | 在浏览器中处理 PDF |
| 图片压缩优化 | 客户端 | 压缩图片文件大小 |
| 二维码生成 | 客户端 | 生成自定义二维码 |

## 技术架构

```
用户请求 → Nginx (443) → Next.js 前端 (3000)
                          ↓
                       FastAPI 后端 (8000) → Gotenberg PDF服务 (7000)
```

### 前端技术栈
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3.4
- **国际化**: next-intl (中/英文)
- **图标**: Lucide React

### 后端技术栈
- **框架**: FastAPI
- **语言**: Python 3.11
- **PDF服务**: Gotenberg 8
- **限流**: 滑动窗口 (5请求/分钟/IP)

### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx Alpine
- **安全**: MIME类型验证、内容大小限制

## 快速部署

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- 域名 (生产环境 HTTPS)

### 一键部署

```bash
# 克隆代码
git clone https://github.com/dzuqiu-wq/all-in-one.git
cd all-in-one-toolbox

# 启动服务 (HTTP模式)
docker compose up -d

# 或使用部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 生产环境 HTTPS

```bash
# 1. 安装 Certbot
apt install certbot python3-certbot-nginx

# 2. 申请 SSL 证书
certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# 3. 配置 nginx SSL 并重载
docker exec all-in-one-toolbox-nginx nginx -s reload
```

## 项目结构

```
all-in-one-toolbox/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/    # 国际化路由
│   │   │   │   ├── page.tsx          # 首页
│   │   │   │   └── tools/            # 工具页面
│   │   │   │       ├── word-to-pdf/
│   │   │   │       ├── pdf-merge-split/
│   │   │   │       ├── image-optimizer/
│   │   │   │       └── qrcode-generator/
│   │   │   └── layout.tsx   # 根布局
│   │   ├── components/       # 组件
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   └── i18n/            # 国际化配置
│   └── Dockerfile
│
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── main.py          # API 路由
│   │   └── config.py         # 配置与限流器
│   ├── requirements.txt
│   └── Dockerfile
│
├── nginx/
│   └── default.conf          # Nginx 配置
│
├── docker-compose.yml         # 开发环境
├── docker-compose.prod.yml    # 生产环境
└── deploy.sh                 # 部署脚本
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/v1/convert/word-to-pdf` | POST | Word 转 PDF |
| `/api/v1/convert/excel-to-pdf` | POST | Excel 转 PDF |
| `/api/v1/convert/powerpoint-to-pdf` | POST | PPT 转 PDF |

## 安全特性

- **IP 限流**: 滑动窗口算法，5请求/分钟/IP
- **文件验证**: MIME类型白名单校验
- **大小限制**: 最大 5MB 文件上传
- **网络隔离**: 仅 Nginx 对外暴露

## 开发指南

### 前端开发

```bash
cd frontend
npm install
npm run dev      # 开发模式 http://localhost:3000
npm run build    # 生产构建
```

### 后端开发

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 查看日志

```bash
docker compose logs -f
docker compose logs -f frontend
docker compose logs -f backend
```

## License

MIT
