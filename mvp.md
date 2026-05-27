📄 开发文档 (PRD) & 技术文档 (TAD) 复合大纲
一、 项目定位与视觉风格 (Product Positioning & UX)
产品核心：免登录、无广告弹窗污染（坚持原生的 Google Ads 嵌入）、极速响应的国际化文件处理微型 SaaS 平台。

视觉风格：采用深色模式（Premium SaaS / Cyberpunk 暗黑高密度数据风格）。

设计理由：相比传统工具站廉价的白色表格，暗黑科技风在海外极具极客感和高专业度错觉，能有效延长高净值用户（程序员、设计师、金融从业者）的页面停留时间，从而拉高 Google Ads 的每千次展示收入 (RPM)。

国际化 (i18n)：首发支持 英文 (EN) 与 简体/繁体中文 (ZH)，路由设计为 [domain.com/](https://domain.com/) (默认英文) 和 [domain.com/zh/](https://domain.com/zh/)。

二、 页面流与广告布局设计 (User Growth & Ad Monetization)
针对工具站“即用即走”的特性，采用“双页流 + 动效占位”策略强制刷高广告展现率。

1. 路由与 SEO 结构
/：首页（高密度工具卡片网格，H1/H2 铺满核心 SEO 关键词）。

/tools/word-to-pdf：工具详情页（包含 800 字以上的工具介绍、长尾词文章、FAQ 结构化微数据以规避 AdSense “低价值内容”拒审）。

/tools/word-to-pdf/result：独立结果页（文件处理完后跳转，创造二次广告展现）。

2. 核心广告位（Google AdSense）布局
全局顶栏/底栏：自适应横幅广告（Leaderboard），在移动端采用底部悬浮粘性广告（Mobile Sticky Banner）。

详情页操作区下方：放置 300x250 或 336x280 的矩形广告（Rectangle），这是用户上传文件时视觉最集中的区域。

结果页下载按钮侧边：高显眼度广告，用户寻找“下载”按钮时必然会产生视觉停留。

合规配置：在项目根目录必须严格配置 ads.txt，并预留好激励广告（Rewarding Ads）或插页广告（Interstitials）的触发埋点 Hooks。

三、 技术架构设计 (Technical Architecture)
基于单台 Linux VPS，我们采用 Docker-Compose 进行微服务编排。整个系统架构分为四层：

                 [ 外部网络流量 (HTTPS) ]
                            ↓
              [ Nginx 反向代理 / SSL 卸载 ]
                            ↓
        +-------------------+-------------------+
        ↓                                       ↓
[ Next.js 前端容器 ]                     [ FastAPI 后端容器 ]
(端口 3000, SSR/SEO友好)               (端口 8000, 业务逻辑)
        ↓ (纯前端工具直接在此处理)               ↓ (Word ↔ PDF 请求)
[ 浏览器客户端本地 Canvas/pdf-lib ]       [ Gotenberg 容器 ]
                                         (端口 7000, LibreOffice 隔离环境)
1. 技术栈选型
前台服务：Next.js (TypeScript)

选择理由：强大的 SSR/SSG 能力支撑极致的 SEO 优化。

后台服务：FastAPI (Python)

选择理由：异步高并发特性，天然适合处理文件上传流；与 Python 生态无缝对接，方便未来扩展更复杂的文档解析功能。

核心转换引擎：Gotenberg (Docker Image)

选择理由：无状态、开箱即用的 Office/PDF 转换 API，内部完美封装了 LibreOffice 守护进程，免去配环境的痛苦。

反向代理：Nginx（处理 SSL 证书、Gzip 压缩、静态资源缓存）。

四、 核心业务逻辑实现机制 (Core Implementation)
1. 纯前端工具处理机制 (PDF 合并/分割、图片压缩、二维码)
流程：用户上传文件 -> 触发前端 JS 事件 -> 利用 pdf-lib / browser-image-compression 直接在浏览器内存中处理 -> 生成 Blob URL 供用户下载。

优势：0 带宽消耗、0 磁盘占用、瞬时完成。

2. Word ↔ PDF 后端“防熔断”转换流程
为了防止低配 VPS 的内存被 LibreOffice 瞬间撑爆，技术文档必须包含以下“熔断与风控”逻辑：

Python
# FastAPI 后端核心风控伪代码
from fastapi import FastAPI, UploadFile, HTTPException, status
import requests

app = FastAPI()
GOTENBERG_URL = "http://gotenberg:7000/forms/libreoffice/convert"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 严格限制 5MB

@app.post("/api/convert/word-to-pdf")
async def convert_word_to_pdf(file: UploadFile):
    # 1. 拦截大文件
    file_size = 0
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (Max 5MB)")
    
    # 2. 转发至 Gotenberg 容器进行转换
    try:
        files = {'files': (file.filename, content, file.content_type)}
        response = requests.post(GOTENBERG_URL, files=files, timeout=30) # 30秒硬超时
        if response.status_code == 200:
            # 3. 内存流即时返回，不落盘（不占用VPS硬盘空间）
            return Response(content=response.content, media_type="application/pdf")
        else:
            raise HTTPException(status_code=500, detail="Conversion failed")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Conversion timeout")
五、 MVP 运维与监控 (Operations)
日志与进程守护：使用 Docker 自身的 --restart=always 策略，配合轻量级日志轮转，防止日志挤爆 VPS 磁盘。

速率限制 (Rate Limiting)：在 Nginx 层或 FastAPI 层利用 Slowapi 模块限制单 IP 每分钟请求次数，防止爬虫恶意刷后端转换接口导致广告费还没赚到、服务器先挂了。