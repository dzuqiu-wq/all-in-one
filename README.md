# All-in-One Toolbox

<!-- Badges -->
<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/dzuqiu-wq/all-in-one?style=social)](https://github.com/dzuqiu-wq/all-in-one/stargazers)
[![License](https://img.shields.io/github/license/dzuqiu-wq/all-in-one)](https://github.com/dzuqiu-wq/all-in-one/blob/main/LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=classic&logo=docker)](https://www.docker.com/)

</div>

---

## English

### A powerful document conversion and web tools platform.

🚀 **[Live Demo](https://333654.xyz)** | 📖 [Documentation](#-features) | 🐳 [Docker Deploy](#-quick-start)

---

### 🎯 Features

| Tool | Description |
|------|-------------|
| **Word to PDF** | Server-side LibreOffice conversion. 5-second timeout, memory-only pipeline, zero disk writes. |
| **PDF Merge/Split** | Client-side PDF operations using pdf-lib. No server upload required. |
| **Image Optimizer** | Compress and optimize images directly in the browser. |
| **QR Code Generator** | Generate QR codes instantly with customizable options. |
| **WeChat Generator** | Create WeChat article cover images with custom templates. |
| **Invoice Generator** | Generate professional invoices in PDF format. |
| **PDF Watermark** | Add text or image watermarks to PDF documents. |
| **Data Sanitizer** | Data sanitization tool for sensitive information. |

---

### 🏗️ Architecture

```
                                    ┌─────────────────────────┐
                                    │        Nginx            │
                                    │   (Reverse Proxy)       │
                                    │   Port 80 / 443         │
                                    └───────────┬─────────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
              ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
              │  Next.js 15     │     │   FastAPI       │     │   Gotenberg     │
              │  (Frontend)     │     │   (Backend)     │     │   (PDF Service) │
              │  Port 3000      │────▶│   Port 8000     │────▶│   Port 7000      │
              └─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Tech Stack:**

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, next-intl |
| Backend | FastAPI, Python 3.11+, sliding window rate limiter |
| PDF Service | Gotenberg 8 (LibreOffice) |
| Reverse Proxy | Nginx |
| Container | Docker Compose |

---

### ⚡ Tech Highlights

- **Zero-Disk Policy** — All file operations happen in memory. Your files never touch the disk.
- **5-Second Timeout** — Strict timeout protection ensures fair resource sharing.
- **Rate Limiting** — Sliding window algorithm: 5 requests/minute per IP.
- **Privacy First** — No files stored, no tracking, no cookies required.
- **Responsive Design** — Works on desktop, tablet, and mobile.

---

### 🚀 Quick Start

**Docker (Recommended)**

```bash
# Clone the repository
git clone https://github.com/dzuqiu-wq/all-in-one.git
cd all-in-one/all-in-one-toolbox

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Visit `http://localhost` to use the toolbox.

**Development**

```bash
# Frontend
cd all-in-one-toolbox/frontend
npm install
npm run dev

# Backend
cd all-in-one-toolbox/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 🌐 Deployment

The project includes automated deployment scripts for VPS:

```bash
# Deploy to VPS (requires SSH configuration)
python deploy_vps.py
```

For manual deployment, configure Nginx as a reverse proxy and ensure ports 80/443 are accessible.

---

### 📦 Project Structure

```
all-in-one-toolbox/
├── frontend/              # Next.js 15 application
│   └── src/app/[locale]/tools/   # Tool pages
├── backend/               # FastAPI application
│   └── app/
│       ├── main.py       # API endpoints
│       └── config.py     # Rate limiter & settings
├── nginx/                 # Nginx configuration
├── docker-compose.yml    # Service orchestration
└── docker-compose.prod.yml
```

---

### 🛡️ Security

- Client IP extracted from `X-Real-IP` header (set by Nginx)
- MIME type whitelist validation for all uploads
- File extension validation using suffix check
- Strict file size limits (5MB default)
- Memory-only pipeline with no disk persistence

---

### 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

---

## 中文

### 一个强大的文档转换与网页工具平台。

🚀 **[在线体验](https://333654.xyz)** | 📖 [功能说明](#-功能列表) | 🐳 [Docker 部署](#-快速开始)

---

### 🎯 功能列表

| 工具 | 描述 |
|------|------|
| **Word 转 PDF** | 服务端 LibreOffice 转换。5秒超时，纯内存管道，零磁盘写入。 |
| **PDF 合并/拆分** | 客户端 PDF 操作，使用 pdf-lib，无需上传服务器。 |
| **图片优化器** | 直接在浏览器中压缩和优化图片。 |
| **二维码生成器** | 快速生成自定义选项的二维码。 |
| **微信封面生成器** | 使用自定义模板创建微信文章封面图片。 |
| **发票生成器** | 生成专业 PDF 格式发票。 |
| **PDF 水印** | 为 PDF 文档添加文字或图片水印。 |
| **数据脱敏器** | 快速处理敏感数据脱敏。 |

---

### 🏗️ 技术架构

```
                                    ┌─────────────────────────┐
                                    │        Nginx            │
                                    │   (反向代理)             │
                                    │   端口 80 / 443         │
                                    └───────────┬─────────────┘
                                                │
                        ┌───────────────────────┼───────────────────────┐
                        │                       │                       │
                        ▼                       ▼                       ▼
              ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
              │  Next.js 15     │     │   FastAPI        │     │   Gotenberg     │
              │  (前端)          │     │   (后端)          │     │   (PDF 服务)     │
              │  端口 3000       │────▶│   端口 8000       │────▶│   端口 7000      │
              └─────────────────┘     └─────────────────┘     └─────────────────┘
```

**技术栈：**

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 15, React 19, TypeScript, Tailwind CSS, next-intl |
| 后端 | FastAPI, Python 3.11+, 滑动窗口限流器 |
| PDF 服务 | Gotenberg 8 (LibreOffice) |
| 反向代理 | Nginx |
| 容器化 | Docker Compose |

---

### ⚡ 技术亮点

- **零磁盘策略** — 所有文件操作在内存中完成，文件永不触碰磁盘。
- **5秒超时保护** — 严格的超时机制确保资源公平分配。
- **速率限制** — 滑动窗口算法：每个 IP 每分钟 5 次请求。
- **隐私优先** — 不存储文件，不追踪，无需 cookies。
- **响应式设计** — 支持桌面、平板和手机设备。

---

### 🚀 快速开始

**Docker（推荐）**

```bash
# 克隆仓库
git clone https://github.com/dzuqiu-wq/all-in-one.git
cd all-in-one/all-in-one-toolbox

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 `http://localhost` 即可使用工具箱。

**本地开发**

```bash
# 前端
cd all-in-one-toolbox/frontend
npm install
npm run dev

# 后端
cd all-in-one-toolbox/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 🌐 部署

项目包含 VPS 自动部署脚本：

```bash
# 部署到 VPS（需要 SSH 配置）
python deploy_vps.py
```

手动部署请配置 Nginx 反向代理，确保 80/443 端口可访问。

---

### 📦 项目结构

```
all-in-one-toolbox/
├── frontend/              # Next.js 15 应用
│   └── src/app/[locale]/tools/   # 工具页面
├── backend/               # FastAPI 应用
│   └── app/
│       ├── main.py       # API 端点
│       └── config.py     # 限流器与配置
├── nginx/                 # Nginx 配置
├── docker-compose.yml    # 服务编排
└── docker-compose.prod.yml
```

---

### 🛡️ 安全特性

- 客户端 IP 从 `X-Real-IP` 头提取（Nginx 设置）
- 所有上传文件的 MIME 类型白名单验证
- 文件扩展名使用后缀检查验证
- 严格的文件大小限制（默认 5MB）
- 纯内存管道，无磁盘持久化

---

### 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)。

<br/>

---

<div align="center">

⭐ Star this project if you find it helpful!

</div>