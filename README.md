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

**Document conversion**

| Tool | Description |
|------|-------------|
| **Word to PDF** | Server-side LibreOffice conversion. 5-second timeout, memory-only pipeline, zero disk writes. |
| **Excel to PDF** | Convert .xlsx/.xls workbooks to PDF. Formulas evaluated, charts preserved. |
| **PowerPoint to PDF** | Convert .pptx/.ppt decks to PDF. One slide per page; animations stripped. |
| **PDF Merge/Split** | Client-side PDF operations using pdf-lib. No server upload required. |
| **PDF Watermark** | Add text or image watermarks to PDF documents. |
| **Invoice Generator** | Generate professional invoices in PDF format. |

**Developer tools**

| Tool | Description |
|------|-------------|
| **JSON Formatter** | Format, minify, and validate JSON via native JSON.parse. |
| **Base64 Encoder** | Encode/decode Base64 with URL-safe variant. UTF-8 friendly. |
| **Hash Generator** | SHA-1/256/384/512 via Web Crypto API. No MD5 (cryptographically broken). |
| **Password Generator** | Cryptographically secure passwords via crypto.getRandomValues. |
| **UUID Generator** | RFC 4122 v4 UUIDs, up to 10,000 in a batch. |

**Image & design**

| Tool | Description |
|------|-------------|
| **Image Optimizer** | Compress and optimize images directly in the browser. |
| **Image Converter** | Convert PNG ↔ JPEG ↔ WebP via Canvas. |
| **Image Resizer** | Resize images with aspect-ratio lock. |
| **Color Converter** | Convert HEX/RGB/HSL with live preview. |
| **QR Code Generator** | Generate QR codes with customizable options. |
| **WeChat Generator** | Create WeChat article cover images with custom templates. |

**Data utilities**

| Tool | Description |
|------|-------------|
| **Data Sanitizer** | Auto-detect and fix CSV/Excel encoding issues. |

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

**文档转换**

| 工具 | 描述 |
|------|------|
| **Word 转 PDF** | 服务端 LibreOffice 转换。5秒超时，纯内存管道。 |
| **Excel 转 PDF** | 转换 .xlsx/.xls 表格为 PDF。公式被计算，图表保留。 |
| **PowerPoint 转 PDF** | 转换 .pptx/.ppt 演示文稿为 PDF。每页一张幻灯片，动画被剥离。 |
| **PDF 合并/拆分** | 基于 pdf-lib 的客户端 PDF 操作，无需上传。 |
| **PDF 水印** | 为 PDF 添加文字或图片水印。 |
| **发票生成器** | 生成专业 PDF 格式发票。 |

**开发者工具**

| 工具 | 描述 |
|------|------|
| **JSON 格式化** | 通过原生 JSON.parse 格式化、压缩、验证 JSON。 |
| **Base64 编解码** | Base64 编解码，支持 URL-safe 变体，UTF-8 友好。 |
| **哈希生成器** | SHA-1/256/384/512 via Web Crypto API。不提供 MD5（已被破解）。 |
| **密码生成器** | 通过 crypto.getRandomValues 生成密码学安全的密码。 |
| **UUID 生成器** | RFC 4122 v4 UUID，一次最多 10,000 个。 |

**图片与设计**

| 工具 | 描述 |
|------|------|
| **图片优化器** | 直接在浏览器中压缩和优化图片。 |
| **图片格式转换** | 通过 Canvas 转换 PNG ↔ JPEG ↔ WebP。 |
| **图片尺寸调整** | 调整图片尺寸，支持锁定纵横比。 |
| **颜色转换器** | HEX/RGB/HSL 双向转换，实时预览。 |
| **二维码生成器** | 生成自定义选项的二维码。 |
| **微信封面生成器** | 使用自定义模板创建微信文章封面图片。 |

**数据工具**

| 工具 | 描述 |
|------|------|
| **数据脱敏器** | 自动检测并修复 CSV/Excel 编码问题。 |

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