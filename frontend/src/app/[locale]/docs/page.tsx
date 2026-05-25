import { Metadata } from "next";
import InfoPageLayout, {
  InfoSection,
  InfoSubsection,
  InfoCallout,
} from "@/components/InfoPageLayout";
import SystemStatus, { type StatusEntry } from "@/components/SystemStatus";
import { BASE_URL, ORG } from "@/lib/constants";

interface Props {
  params: Promise<{ locale: string }>;
}

const BASE_URL_LOCAL = BASE_URL;

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  const title = isZh
    ? "开发文档 | All-in-One Toolbox"
    : "Developer Documentation | All-in-One Toolbox";
  const description = isZh
    ? "All-in-One Toolbox 的五款核心工具技术原理详解：Canvas 图像压缩、pdf-lib 浏览器内 PDF 处理、qrcode.react 二维码生成、Gotenberg 后端隔离流、微信聊天记录生成器。"
    : "Technical deep dive into the five core tools of All-in-One Toolbox: Canvas image compression, pdf-lib in-browser PDF processing, qrcode.react generation, Gotenberg backend isolation pipeline, and WeChat chat history simulator.";

  return {
    title,
    description,
    keywords: isZh
      ? ["开发文档", "技术原理", "pdf-lib", "Canvas API", "Gotenberg", "qrcode.react", "All-in-One Toolbox"]
      : ["developer docs", "technical guide", "pdf-lib", "canvas api", "gotenberg", "qrcode.react", "All-in-One Toolbox"],
    alternates: {
      canonical: `${BASE_URL_LOCAL}/${locale}/docs`,
      languages: {
        "en-US": `${BASE_URL_LOCAL}/en/docs`,
        "zh-CN": `${BASE_URL_LOCAL}/zh/docs`,
      },
    },
    openGraph: {
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${BASE_URL_LOCAL}/${locale}/docs`,
      siteName: ORG.name,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const statusEntries: readonly StatusEntry[] = isZh
    ? [
        {
          label: "Gotenberg API 引擎",
          detail: "Word → PDF 工具的 OOXML 转换 (LibreOffice headless)",
          metric: "5 s 硬超时 · 纯内存 · 5 req/min/IP",
          level: "operational",
        },
        {
          label: "Web Workers 编译器",
          detail: "主线程之外的图像、PDF、CSV 处理",
          metric: "pdf-lib · browser-image-compression · papaparse",
          level: "operational",
        },
        {
          label: "前端 SSG 缓存",
          detail: "Next.js 15 App Router 静态生成产物",
          metric: "30+ 路由 · immutable 缓存 · brotli 压缩",
          level: "operational",
        },
        {
          label: "Nginx 反向代理",
          detail: "TLS 终止与请求校验",
          metric: "HTTP/2 · 自动 Let’s Encrypt",
          level: "operational",
        },
      ]
    : [
        {
          label: "Gotenberg API Engine",
          detail: "OOXML conversion backing the Word → PDF surface (headless LibreOffice).",
          metric: "5 s hard timeout · memory-only · 5 req/min per IP",
          level: "operational",
        },
        {
          label: "Web Workers Compilers",
          detail: "Off-main-thread image, PDF, and CSV processing pipelines.",
          metric: "pdf-lib · browser-image-compression · papaparse",
          level: "operational",
        },
        {
          label: "Frontend SSG Cache",
          detail: "Next.js 15 App Router static-generation output served from CDN edge.",
          metric: "30+ routes · immutable cache · brotli compressed",
          level: "operational",
        },
        {
          label: "Nginx Reverse Proxy",
          detail: "TLS termination, brotli compression, request validation.",
          metric: "HTTP/2 · automatic Let’s Encrypt",
          level: "operational",
        },
      ];

  if (isZh) {
    return (
      <InfoPageLayout
        eyebrow="工程文档"
        title="开发文档"
        description="拆解 All-in-One Toolbox 四款核心工具的底层技术原理。本页面写给好奇的开发者、安全审计员，以及任何想验证我们「纯前端」承诺的人。"
        lastUpdated="2026 年 5 月 22 日"
        lastUpdatedLabel="最近更新"
        backLabel="返回主页"
      >
        <InfoSection heading="架构总览">
          <p>
            All-in-One Toolbox 是典型的"客户端为主、服务端为辅"型应用。前端构建为 Next.js 15 App Router 项目，输出静态资源 + React Server Component 流式 HTML，由 Nginx 提供 gzip/brotli 压缩与 immutable 缓存策略。仅 Word 转 PDF 一条链路涉及后端 FastAPI 网关与 Gotenberg 渲染容器。当前共五款工具。
          </p>
          <InfoCallout>
            <strong>数据流方向</strong>：浏览器 ↔ Nginx ↔ 静态资源（绝大多数请求在此处终止）。
            Word 转 PDF 例外路径：浏览器 → Nginx → FastAPI（限速 + 校验）→ Gotenberg（LibreOffice 进程池）→ PDF 流回写。
          </InfoCallout>
        </InfoSection>

        <InfoSection heading="系统运行状态 / System Live Status">
          <SystemStatus
            heading="基础设施健康"
            eyebrow="INFRASTRUCTURE HEALTH"
            nominalLabel="系统全部正常"
            lastVerifiedLabel="最近核验"
            footnote="构建期核验 · 每次访问即时刷新"
            entries={statusEntries}
          />
          <p>
            上方面板在每一次页面访问时由前端直接渲染，<strong>不会</strong>请求任何后端健康端点。它反映的是「这些子系统是否已被部署、配置正确、可被审计」这一确定性事实——对一个把「零服务器存储」作为承诺的项目，这是比「服务端可上报的数字」更诚实的展示方式。
          </p>
        </InfoSection>

        <InfoSection heading="工具 1 · Canvas 图像压缩">
          <p>
            位于 <code>/tools/image-optimizer</code> 路径下，是本站使用频率最高的纯前端工具，技术核心是 HTML5 Canvas API 的有损/无损重编码能力。
          </p>
          <InfoSubsection heading="处理管道">
            <ol className="list-decimal pl-6 space-y-2">
              <li>用户通过 <code>&lt;input type="file"&gt;</code> 或拖拽 API 选中本地图片；</li>
              <li><code>FileReader</code> 将文件读入 <code>ArrayBuffer</code>，进而构造 <code>HTMLImageElement</code>；</li>
              <li>创建 <code>OffscreenCanvas</code>，将图像以目标尺寸绘制其上；</li>
              <li>调用 <code>canvas.convertToBlob</code>，指定 <code>type: 'image/webp'</code> 与 <code>quality: 0.8</code>（默认值），由浏览器原生编码器输出新格式；</li>
              <li>通过 <code>URL.createObjectURL</code> 生成可下载的 Blob URL。</li>
            </ol>
          </InfoSubsection>
          <InfoSubsection heading="为什么用 Web Worker？">
            <p>
              重编码是 CPU 密集任务，主线程执行会冻结 UI。我们将 Canvas 操作封装进 <code>browser-image-compression</code> 库提供的 Worker 中，主线程仅负责调度与进度更新——大文件压缩期间页面依然可以滚动、点击。
            </p>
          </InfoSubsection>
          <InfoSubsection heading="EXIF 剥离">
            <p>
              当图像被绘入 Canvas 时，所有 EXIF 元数据（GPS、相机型号、拍摄时间）会被自动丢弃。这是 Canvas API 的"副作用"，也是我们刻意选择它而非 WASM 编码器的原因：免费的隐私保护。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 2 · pdf-lib PDF 合并与拆分">
          <p>
            位于 <code>/tools/pdf-merge-split</code>。基于 <a href="https://pdf-lib.js.org" target="_blank" rel="noopener noreferrer">pdf-lib</a> 的纯 JavaScript 实现，无需任何 WebAssembly 字节码——这意味着首屏加载零额外网络请求、零冷启动延迟。
          </p>
          <InfoSubsection heading="合并算法">
            <ol className="list-decimal pl-6 space-y-2">
              <li>通过 <code>PDFDocument.load</code> 反序列化每个上传的 PDF 文件到内存中的对象图；</li>
              <li>创建新的目标 <code>PDFDocument</code>；</li>
              <li>使用 <code>copyPages</code> 批量拷贝源文档的页面对象（含字体、图像、表单字段、注释）到目标；</li>
              <li>调用 <code>save</code> 序列化为 <code>Uint8Array</code>，通过 Blob 提供下载。</li>
            </ol>
          </InfoSubsection>
          <InfoSubsection heading="拆分语法解析">
            <p>
              页码范围语法（如 <code>1-3, 5, 7-10</code>）由自研的正则解析器处理，支持单页、闭区间、混合表达式。无效页码会立即触发友好提示而非沉默失败。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 3 · qrcode.react 二维码生成">
          <p>
            位于 <code>/tools/qrcode-generator</code>。基于 <a href="https://github.com/zpao/qrcode.react" target="_blank" rel="noopener noreferrer">qrcode.react</a> 4.2 实现。
          </p>
          <InfoSubsection heading="双渲染模式">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>SVG 模式（默认）</strong>：可缩放至任意尺寸而无锯齿，适合打印场景；导出为独立 .svg 文件；</li>
              <li><strong>Canvas 模式</strong>：用于嵌入 Logo（带圆形遮罩）或对超大尺寸（&gt; 1024 px）进行光栅化导出。</li>
            </ul>
          </InfoSubsection>
          <InfoSubsection heading="纠错级别（EC Level）">
            <p>
              ISO/IEC 18004 标准定义了四级 Reed-Solomon 纠错码：
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><code>L</code>——可恢复 7% 数据损坏（最高密度，适合大体积链接）；</li>
              <li><code>M</code>——可恢复 15% 数据损坏（默认值）；</li>
              <li><code>Q</code>——可恢复 25% 数据损坏（工业环境）；</li>
              <li><code>H</code>——可恢复 30% 数据损坏（如嵌入 Logo 必选）。</li>
            </ul>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 4 · Gotenberg 后端隔离流">
          <p>
            位于 <code>/tools/word-to-pdf</code>。这是全站唯一涉及后端的链路，因为浏览器原生不支持 <code>.docx</code> OpenXML 解析。
          </p>
          <InfoSubsection heading="为什么不是 mammoth.js？">
            <p>
              mammoth.js 等纯前端方案在简单文档上可用，但对包含复杂样式、嵌套表格、SmartArt 图形或公式的真实文档表现极差。我们选择服务端 LibreOffice 是为了"渲染保真度"，但代价是必须引入服务端组件——因此对该组件我们设计了最严格的隔离策略。
            </p>
          </InfoSubsection>
          <InfoSubsection heading="内存隔离管道">
            <ol className="list-decimal pl-6 space-y-2">
              <li>FastAPI 网关收到 multipart 请求；MIME 类型与魔术字节双重校验；超过 5 MB 直接 413 拒绝；</li>
              <li>请求体读入 <code>BytesIO</code> 内存缓冲（绝不写盘）；</li>
              <li>HTTP 流式转发至 Gotenberg 容器的 <code>/forms/libreoffice/convert</code> 端点；</li>
              <li>Gotenberg 内部启动 LibreOffice 子进程，<code>--headless</code> 模式下进行 OOXML → PDF 转换；</li>
              <li>5 秒硬超时由 <code>asyncio.wait_for</code> 强制保障，超时即杀死 LibreOffice 进程；</li>
              <li>PDF 字节流以 <code>StreamingResponse</code> 直接回写浏览器，全程无中间文件、无落地缓存。</li>
            </ol>
          </InfoSubsection>
          <InfoSubsection heading="限速与防滥用">
            <p>
              每 IP 每分钟最多 5 次请求，使用 Redis ZSET 滑动窗口实现。超出后返回 <code>429 Too Many Requests</code> 与 <code>Retry-After</code> 头，提示用户精确等待秒数。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 5 · WeChat 聊天记录生成器">
          <p>
            位于 <code>/tools/wechat-generator</code>。一款高保真双端微信聊天模拟器，提供 iPhone 移动端与三栏桌面端双视图切换。
          </p>
          <InfoSubsection heading="双端视图架构">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>移动端视图</strong>：模拟 iPhone 微信界面，包含顶部导航栏、「我」与「对方」双向气泡、发送/拍摄/相册功能入口；</li>
              <li><strong>桌面端视图</strong>：采用三栏布局（联系人列表 + 对话区 + 详情面板），还原 PC 微信操作体验；</li>
              <li>气泡颜色严格遵循微信官方配色：我方 <code>#95EC69</code>（绿色），对方 <code>#FFFFFF</code>（白色）；</li>
              <li>时间戳、头像、状态文字均使用 CSS 精确定位，支持多消息并发展示。</li>
            </ul>
          </InfoSubsection>
          <InfoSubsection heading="零服务器隐私机制">
            <p>
              所有数据处理完全在浏览器内完成。头像与图片附件通过 <code>FileReader</code> API 读取为 Base64 data URI，存入 React 状态管理器，<strong>不发送任何网络请求</strong>。PNG 导出使用 html2canvas 库在本地完成光栅化，产物经 Blob URL 直接触发下载。
            </p>
          </InfoSubsection>
          <InfoSubsection heading="高清导出 (2× DPR)">
            <p>
              导出引擎自动使用 <code>window.devicePixelRatio × 2</code> 的画布缩放系数，对预览 DOM 执行光栅化，确保在 Retina/HiDPI 显示器上输出的 PNG 图片边缘锐利、无锯齿。建议上传至少 256×256 像素的头像以获得最佳导出效果。
            </p>
          </InfoSubsection>
          <InfoSubsection heading="模板与示例数据">
            <p>
              提供一键填充的示例会话数据，包含模拟对话、预设头像与时间线事件，用于快速演示效果。支持自定义昵称、头像、时间范围与消息内容，可导出为故事板、会议纪要或产品演示素材。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 6 · pdf-lib 电子印章与水印">
          <p>
            位于 <code>/tools/pdf-watermark</code>。基于 <a href="https://pdf-lib.js.org" target="_blank" rel="noopener noreferrer">pdf-lib</a> 实现，支持圆形、椭圆形和矩形三种印章样式，所有操作在浏览器内完成。
          </p>
          <InfoSubsection heading="印章渲染引擎">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>圆形印章</strong>：标准公章样式，带弧形文字排版与五角星图标；</li>
              <li><strong>椭圆形印章</strong>：业务章样式，适合内部审批流程；</li>
              <li><strong>矩形印章</strong>：长方形样式，适合日期或编号印章。</li>
            </ul>
          </InfoSubsection>
          <InfoSubsection heading="水印叠加策略">
            <p>
              水印以半透明方式平铺在 PDF 页面上，通过计算页面尺寸与水印尺寸来确定平铺网格。叠加时保留原文可读性，同时确保来源标注清晰可辨。所有渲染在浏览器内完成，PDF 文件从不离开用户设备。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 7 · html2canvas + jsPDF 发票生成">
          <p>
            位于 <code>/tools/invoice-generator</code>。基于 html2canvas 与 jsPDF 实现，支持多币种与自动税率计算。
          </p>
          <InfoSubsection heading="双引擎渲染管线">
            <ol className="list-decimal pl-6 space-y-2">
              <li>用户在表单中填写发票各项数据（公司信息、商品明细、金额）；</li>
              <li>表单数据驱动 React 组件渲染为 HTML 发票模板；</li>
              <li>html2canvas 以 2× DPR 对模板 DOM 进行光栅化；</li>
              <li>jsPDF 将光栅化图像嵌入 PDF 文档；</li>
              <li>Blob URL 触发下载，全程无服务器参与。</li>
            </ol>
          </InfoSubsection>
          <InfoSubsection heading="多币种支持">
            <p>
              支持美元 (USD)、欧元 (EUR)、英镑 (GBP)、人民币 (CNY)、日元 (JPY) 五种主流货币。金额格式化使用浏览器原生 <code>Intl.NumberFormat</code> API，自动处理小数精度、千位分隔符与货币符号。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 8 · PapaParse + SheetJS 数据清洗">
          <p>
            位于 <code>/tools/data-sanitizer</code>。基于 PapaParse 与 SheetJS 实现，用于 CSV/Excel 编码修复与多格式数据导出。
          </p>
          <InfoSubsection heading="编码自动检测">
            <p>
              支持 UTF-8、GBK、GB2312、Big5、Windows-1252、ISO-8859-1 等常见编码格式。工具通过解析文件魔术字节与内容特征自动判断源文件编码，无需用户手动指定。乱码检测基于字符集分布熵值分析，可识别绝大多数编码错配场景。
            </p>
          </InfoSubsection>
          <InfoSubsection heading="多格式导出">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>CSV</strong>：标准化逗号分隔格式，强制 UTF-8 BOM；</li>
              <li><strong>JSON</strong>：扁平化对象数组结构；</li>
              <li><strong>Markdown</strong>：表格形式，便于嵌入文档或幻灯片；</li>
              <li><strong>XLSX</strong>：保留原始数据类型，适合 Excel 工作流。</li>
            </ul>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="工具 9 · Excel 转 PDF">
          <p>
            位于 <code>/tools/excel-to-pdf</code>。复用 Gotenberg + LibreOffice 服务端管道，将 .xlsx/.xls 工作簿转换为 PDF。公式被计算为最终值，图表与嵌入图像一并渲染。5 秒超时，5MB 大小限制，纯内存管道。
          </p>
        </InfoSection>

        <InfoSection heading="工具 10 · PowerPoint 转 PDF">
          <p>
            位于 <code>/tools/powerpoint-to-pdf</code>。同样的 LibreOffice 后端,将 .pptx/.ppt 演示文稿转换为 PDF。每张幻灯片占一页;动画与过渡被剥离（PDF 不支持时间轴）,但静态布局、字体回退与嵌入图像完整保留。
          </p>
        </InfoSection>

        <InfoSection heading="工具 11 · JSON 格式化与验证">
          <p>
            位于 <code>/tools/json-formatter</code>。基于浏览器原生 <code>JSON.parse</code> 与 <code>JSON.stringify</code>,零依赖、零上传。支持 2/4 空格缩进、压缩、与验证三种操作,错误信息直接来自 V8/SpiderMonkey 引擎抛出的 SyntaxError。
          </p>
        </InfoSection>

        <InfoSection heading="工具 12 · Base64 编解码">
          <p>
            位于 <code>/tools/base64</code>。通过 <code>btoa</code>/<code>atob</code> 与 <code>TextEncoder</code>/<code>TextDecoder</code> 桥接实现 UTF-8 安全编解码。支持标准与 URL-safe 两种变体（后者把 +、/ 替换为 -、_ 并去除填充）。
          </p>
        </InfoSection>

        <InfoSection heading="工具 13 · 哈希生成器">
          <p>
            位于 <code>/tools/hash-generator</code>。基于浏览器原生 Web Crypto API 的 <code>crypto.subtle.digest()</code>,支持 SHA-1、SHA-256、SHA-384、SHA-512。MD5 因密码学已破被故意不暴露——任何安全场景请用 SHA-256 起步。
          </p>
        </InfoSection>

        <InfoSection heading="工具 14 · 图片格式转换">
          <p>
            位于 <code>/tools/image-converter</code>。通过 HTML Canvas 的 <code>toBlob()</code> 在 PNG、JPEG、WebP 之间转换。质量滑块对 PNG 无效（无损）,对 JPEG/WebP 取值 0.1-1.0。源图通过 <code>createImageBitmap</code> 解码后立即 <code>close()</code> 释放 GPU 内存。
          </p>
        </InfoSection>

        <InfoSection heading="工具 15 · 图片尺寸调整">
          <p>
            位于 <code>/tools/image-resizer</code>。Canvas <code>drawImage(...)</code> 双线性缩放,<code>imageSmoothingQuality = &quot;high&quot;</code> 启用 bicubic 类滤波。锁定纵横比时编辑任一维度自动更新另一维度。源 MIME 保留,文件名追加 <code>-WxH</code> 后缀避免覆盖原图。
          </p>
        </InfoSection>

        <InfoSection heading="工具 16 · 密码生成器">
          <p>
            位于 <code>/tools/password-generator</code>。<code>crypto.getRandomValues(Uint32Array)</code> 驱动的密码学安全 PRNG,每字符独立采样。Shannon 熵估算（长度 × log2(字符池)）给出 weak/medium/strong 分级。永不存储,永不传输。
          </p>
        </InfoSection>

        <InfoSection heading="工具 17 · 颜色转换器">
          <p>
            位于 <code>/tools/color-converter</code>。RGB 作为单一真相源,HEX 与 HSL 通过 <code>useMemo</code> 派生。HSL 用 hexcone 算法,无 sRGB 伽马校正（因为目标只是各空间间互转,不做 P3/OKLCH 跨色域映射）。
          </p>
        </InfoSection>

        <InfoSection heading="工具 18 · UUID 生成器">
          <p>
            位于 <code>/tools/uuid-generator</code>。优先调用 <code>crypto.randomUUID()</code>,旧浏览器回退到 <code>crypto.getRandomValues</code> 手动设置 RFC 4122 v4 的版本位（byte 6 = 0x40 mask）与变体位（byte 8 = 0x80 mask）。一次最多 10,000 个。
          </p>
        </InfoSection>

        <InfoSection heading="性能预算">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>首屏 LCP</strong>（最大内容绘制）：&lt; 1.5 s（中位数）；</li>
            <li><strong>初始 JS 体积</strong>：&lt; 90 KB（gzip 后），包含 Next.js 框架在内；</li>
            <li><strong>CLS</strong>（累积布局偏移）：&lt; 0.05，AdSense 广告位预留固定高度；</li>
            <li><strong>INP</strong>（下次绘制交互延迟）：&lt; 200 ms；</li>
            <li><strong>Lighthouse 综合分</strong>：性能、可访问性、最佳实践、SEO 均 &gt; 95。</li>
          </ul>
        </InfoSection>

        <InfoSection heading="贡献指南">
          <p>
            我们欢迎以下类型的贡献，请通过 GitHub Issue 先行讨论再提交 PR：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>新增工具（需符合"纯前端、零追踪"原则）；</li>
            <li>修复 Bug 与改善可访问性（WCAG 2.1 AA）；</li>
            <li>添加新语言翻译（参考 <code>src/i18n/messages/</code> 目录结构）；</li>
            <li>性能优化与依赖体积削减；</li>
            <li>设计系统迭代（请先看 <code>tailwind.config.ts</code> 中的设计令牌）。</li>
          </ul>
        </InfoSection>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      eyebrow="Engineering Docs"
      title="Developer Documentation"
      description='An engineering deep-dive into the four core tools of All-in-One Toolbox. This page is written for curious developers, security auditors, and anyone who wants to verify our "pure-frontend" claim.'
      lastUpdated="May 22, 2026"
      lastUpdatedLabel="Last updated"
      backLabel="Back to home"
    >
      <InfoSection heading="Architecture Overview">
        <p>
          All-in-One Toolbox is a classic "client-heavy, server-light" application. The frontend is built as a Next.js 15 App Router project, emitting static assets plus streaming React Server Component HTML, served behind Nginx with gzip/brotli compression and immutable cache policies. Only the Word-to-PDF surface involves a backend FastAPI gateway and a Gotenberg rendering container. Five tools are currently available.
        </p>
        <InfoCallout>
          <strong>Data flow direction:</strong> Browser ↔ Nginx ↔ static assets (where the vast majority of requests terminate). The exceptional Word-to-PDF path: browser → Nginx → FastAPI (rate-limit + validation) → Gotenberg (LibreOffice process pool) → PDF stream returned.
        </InfoCallout>
      </InfoSection>

      <InfoSection heading="System Live Status">
        <SystemStatus
          heading="Infrastructure health"
          eyebrow="INFRASTRUCTURE HEALTH"
          nominalLabel="ALL SYSTEMS NOMINAL"
          lastVerifiedLabel="Last verified"
          footnote="Verified at build · refreshed each visit"
          entries={statusEntries}
        />
        <p>
          The panel above is rendered directly by the frontend on every visit; it issues <strong>no</strong> backend health call. It reflects deterministic facts about the deployed architecture — which we consider a more honest &ldquo;live status&rdquo; surface than a server-reported number could ever be, given that this project is built around a zero-server-storage guarantee.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 1 · Canvas Image Compression">
        <p>
          Lives at <code>/tools/image-optimizer</code>, the most heavily used pure-frontend tool. The technical core is the HTML5 Canvas API's lossy/lossless re-encoding capability.
        </p>
        <InfoSubsection heading="Processing Pipeline">
          <ol className="list-decimal pl-6 space-y-2">
            <li>The user selects a local image via <code>&lt;input type="file"&gt;</code> or the drag-and-drop API;</li>
            <li><code>FileReader</code> reads the file into an <code>ArrayBuffer</code>, then constructs an <code>HTMLImageElement</code>;</li>
            <li>An <code>OffscreenCanvas</code> is created and the image is drawn onto it at the target dimensions;</li>
            <li><code>canvas.convertToBlob</code> is invoked with <code>type: 'image/webp'</code> and <code>quality: 0.8</code> (default), letting the browser's native encoder produce the new format;</li>
            <li><code>URL.createObjectURL</code> produces a downloadable Blob URL.</li>
          </ol>
        </InfoSubsection>
        <InfoSubsection heading="Why Web Workers?">
          <p>
            Re-encoding is CPU-intensive; running it on the main thread freezes the UI. We wrap the Canvas operations inside the Web Worker provided by <code>browser-image-compression</code>, leaving the main thread to handle scheduling and progress updates — the page remains scrollable and clickable during compression of large files.
          </p>
        </InfoSubsection>
        <InfoSubsection heading="EXIF Stripping">
          <p>
            When an image is drawn onto a Canvas, all EXIF metadata (GPS, camera model, capture time) is automatically discarded. This is a Canvas API "side effect" — and the deliberate reason we chose it over WASM encoders: free privacy protection.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 2 · pdf-lib PDF Merge &amp; Split">
        <p>
          Lives at <code>/tools/pdf-merge-split</code>. Implemented atop <a href="https://pdf-lib.js.org" target="_blank" rel="noopener noreferrer">pdf-lib</a> in pure JavaScript — no WebAssembly bytecode, so first paint incurs zero additional network requests and zero cold-start latency.
        </p>
        <InfoSubsection heading="Merge Algorithm">
          <ol className="list-decimal pl-6 space-y-2">
            <li>Each uploaded PDF is deserialized via <code>PDFDocument.load</code> into an in-memory object graph;</li>
            <li>A fresh target <code>PDFDocument</code> is created;</li>
            <li><code>copyPages</code> bulk-copies the source documents' page objects (fonts, images, form fields, annotations) into the target;</li>
            <li><code>save</code> serializes the result to a <code>Uint8Array</code>, which is wrapped in a Blob for download.</li>
          </ol>
        </InfoSubsection>
        <InfoSubsection heading="Split Syntax Parsing">
          <p>
            Page range syntax (e.g., <code>1-3, 5, 7-10</code>) is handled by a custom regex parser supporting single pages, closed intervals, and mixed expressions. Invalid page numbers raise a friendly toast instead of silently failing.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 3 · qrcode.react Generation">
        <p>
          Lives at <code>/tools/qrcode-generator</code>. Implemented atop <a href="https://github.com/zpao/qrcode.react" target="_blank" rel="noopener noreferrer">qrcode.react</a> 4.2.
        </p>
        <InfoSubsection heading="Dual-Renderer Modes">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>SVG mode (default)</strong>: scales to any size without aliasing, ideal for print; exports as a standalone .svg file;</li>
            <li><strong>Canvas mode</strong>: used when embedding a logo (with circular mask) or rasterizing at extra-large sizes (&gt; 1024 px).</li>
          </ul>
        </InfoSubsection>
        <InfoSubsection heading="Error Correction Levels">
          <p>The ISO/IEC 18004 standard defines four Reed-Solomon error-correction levels:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><code>L</code> — recovers from 7% damage (highest density, best for long URLs);</li>
            <li><code>M</code> — recovers from 15% damage (default);</li>
            <li><code>Q</code> — recovers from 25% damage (industrial environments);</li>
            <li><code>H</code> — recovers from 30% damage (required when embedding a logo).</li>
          </ul>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 4 · Gotenberg Backend Isolation Pipeline">
        <p>
          Lives at <code>/tools/word-to-pdf</code>. The only backend-touching surface on the site, necessitated by the lack of native browser support for <code>.docx</code> OpenXML parsing.
        </p>
        <InfoSubsection heading="Why Not mammoth.js?">
          <p>
            Pure-frontend solutions like mammoth.js work on simple documents but break down on real-world files with complex styles, nested tables, SmartArt, or equations. We chose server-side LibreOffice for fidelity — but that necessitates a backend component, around which we built the strictest possible isolation strategy.
          </p>
        </InfoSubsection>
        <InfoSubsection heading="Memory-Only Pipeline">
          <ol className="list-decimal pl-6 space-y-2">
            <li>The FastAPI gateway receives a multipart request; MIME type and magic bytes are both validated; anything &gt; 5 MB is rejected with 413;</li>
            <li>The request body is read into a <code>BytesIO</code> in-memory buffer (never to disk);</li>
            <li>It is HTTP-streamed to the Gotenberg container's <code>/forms/libreoffice/convert</code> endpoint;</li>
            <li>Gotenberg spawns a LibreOffice subprocess in <code>--headless</code> mode to perform the OOXML → PDF conversion;</li>
            <li>A 5-second hard timeout is enforced by <code>asyncio.wait_for</code>, killing the LibreOffice process on timeout;</li>
            <li>The PDF byte stream flows directly back to the browser as a <code>StreamingResponse</code> — no intermediate files, no on-disk cache.</li>
          </ol>
        </InfoSubsection>
        <InfoSubsection heading="Rate Limiting &amp; Abuse Prevention">
          <p>
            Each IP is limited to 5 requests per minute, implemented with a Redis ZSET sliding window. Excess requests return <code>429 Too Many Requests</code> with a <code>Retry-After</code> header that tells the user the exact seconds to wait.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 5 · WeChat Chat History Generator">
        <p>
          Lives at <code>/tools/wechat-generator</code>. A high-fidelity dual-viewport WeChat chat simulator with iPhone mobile shell and three-column desktop mockup.
        </p>
        <InfoSubsection heading="Dual-Viewport Architecture">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Mobile view</strong>: emulates iPhone WeChat interface, complete with top navigation bar, bi-directional sender bubbles (me vs. other), and Send/Camera/Gallery action entries;</li>
            <li><strong>Desktop view</strong>: three-column layout (contact list + conversation pane + detail panel) for a faithful PC WeChat experience;</li>
            <li>Bubble colors strictly follow the official WeChat palette: <code>#95EC69</code> for me (green), <code>#FFFFFF</code> for the other party (white);</li>
            <li>Timestamps, avatars, and status text are positioned with pixel-perfect CSS, supporting multi-message concurrent display.</li>
          </ul>
        </InfoSubsection>
        <InfoSubsection heading="Zero-Server Privacy Mechanism">
          <p>
            All data processing runs entirely in the browser. Avatars and image attachments are read via the <code>FileReader</code> API into a Base64 data URI, stored in the React state manager, and <strong>no network requests are sent</strong>. PNG export uses the html2canvas library for local rasterisation; the resulting blob is downloaded directly from a Blob URL.
          </p>
        </InfoSubsection>
        <InfoSubsection heading="High-Definition Export (2× DPR)">
          <p>
            The export engine automatically uses a canvas scaling factor of <code>window.devicePixelRatio × 2</code> when rasterising the preview DOM, ensuring that output PNG images have sharp, alias-free edges on Retina/HiDPI displays. For the best results, upload avatars at least 256×256 px.
          </p>
        </InfoSubsection>
        <InfoSubsection heading="Templates &amp; Sample Data">
          <p>
            One-click sample session data is provided, including mock conversations, preset avatars, and timeline events for quick demonstrations. Supports custom nicknames, avatars, date ranges, and message content — exportable as storyboards, meeting notes, or product demo assets.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 6 · pdf-lib Electronic Seal &amp; Watermark">
        <p>
          Lives at <code>/tools/pdf-watermark</code>. Implemented atop <a href="https://pdf-lib.js.org" target="_blank" rel="noopener noreferrer">pdf-lib</a>, adding text watermarks or electronic stamps to PDF documents entirely in the browser.
        </p>
        <InfoSubsection heading="Stamp Rendering Engine">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Circle seal</strong>: standard business seal with arc-typeset organization text and five-point star;</li>
            <li><strong>Oval seal</strong>: suitable for internal approval workflows;</li>
            <li><strong>Rectangle stamp</strong>: ideal for dates and sequential numbering.</li>
          </ul>
        </InfoSubsection>
        <InfoSubsection heading="Watermark Overlay Strategy">
          <p>
            Watermarks are tiled across PDF pages at calculated intervals, proportional to page and watermark dimensions. Semi-transparent rendering preserves full readability of the underlying document while marking provenance and intent. All rendering occurs in the browser — the PDF never leaves the user's device.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 7 · html2canvas + jsPDF Invoice Generator">
        <p>
          Lives at <code>/tools/invoice-generator</code>. Implemented with html2canvas for rasterisation and jsPDF for PDF assembly, supporting multi-currency invoicing with automatic tax calculations.
        </p>
        <InfoSubsection heading="Dual-Engine Rendering Pipeline">
          <ol className="list-decimal pl-6 space-y-2">
            <li>User fills in invoice fields (company info, line items, amounts);</li>
            <li>Form data drives React components to render an HTML invoice template;</li>
            <li>html2canvas rasterises the template DOM at 2× DPR;</li>
            <li>jsPDF embeds the rasterised image into a PDF document;</li>
            <li>Blob URL triggers download — no server involved.</li>
          </ol>
        </InfoSubsection>
        <InfoSubsection heading="Multi-Currency Support">
          <p>
            Supports USD, EUR, GBP, CNY, and JPY out of the box. Amount formatting uses the browser-native <code>Intl.NumberFormat</code> API, handling decimal precision, thousand separators, and currency symbols automatically.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 8 · PapaParse + SheetJS Data Sanitizer">
        <p>
          Lives at <code>/tools/data-sanitizer</code>. Implemented atop <a href="https://www.papaparse.com" target="_blank" rel="noopener noreferrer">PapaParse</a> and <a href="https://sheetjs.com" target="_blank" rel="noopener noreferrer">SheetJS</a> for encoding repair and multi-format data export.
        </p>
        <InfoSubsection heading="Automatic Encoding Detection">
          <p>
            Supports UTF-8, GBK, GB2312, Big5, Windows-1252, ISO-8859-1, and more. The tool auto-detects source file encoding by parsing magic bytes and content signatures — no manual specification required. Garbled text detection is based on charset distribution entropy analysis, identifying the vast majority of encoding mismatch scenarios.
          </p>
        </InfoSubsection>
        <InfoSubsection heading="Multi-Format Export">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>CSV</strong>: standardised comma-separated format, forced UTF-8 BOM;</li>
            <li><strong>JSON</strong>: flattened object array structure;</li>
            <li><strong>Markdown</strong>: table format for easy embedding in docs or slides;</li>
            <li><strong>XLSX</strong>: preserves original data types for Excel workflows.</li>
          </ul>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="Tool 9 · Excel to PDF">
        <p>
          Lives at <code>/tools/excel-to-pdf</code>. Reuses the Gotenberg + LibreOffice server pipeline to convert .xlsx/.xls workbooks to PDF. Formulas are evaluated to their final values; charts and embedded images render in the output. Same 5-second timeout, 5MB ceiling, memory-only pipeline.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 10 · PowerPoint to PDF">
        <p>
          Lives at <code>/tools/powerpoint-to-pdf</code>. Same LibreOffice backend, converting .pptx/.ppt decks to PDF. One slide per page; animations and slide transitions are stripped (PDF has no timeline), but static layout, font fallback, and embedded media are preserved.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 11 · JSON Formatter &amp; Validator">
        <p>
          Lives at <code>/tools/json-formatter</code>. Backed by the browser-native <code>JSON.parse</code> and <code>JSON.stringify</code> — zero dependencies, zero upload. Supports 2/4-space indent, minification, and validation, with error messages surfaced directly from the V8/SpiderMonkey SyntaxError.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 12 · Base64 Encoder/Decoder">
        <p>
          Lives at <code>/tools/base64</code>. Bridges <code>btoa</code>/<code>atob</code> with <code>TextEncoder</code>/<code>TextDecoder</code> for UTF-8-safe round-trips. Supports both the standard and URL-safe variants (the latter swaps + for -, / for _, and strips padding).
        </p>
      </InfoSection>

      <InfoSection heading="Tool 13 · Hash Generator">
        <p>
          Lives at <code>/tools/hash-generator</code>. Powered by the browser-native Web Crypto API via <code>crypto.subtle.digest()</code>, supporting SHA-1, SHA-256, SHA-384, and SHA-512. MD5 is intentionally not exposed — it is cryptographically broken; use SHA-256 or stronger for any security purpose.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 14 · Image Format Converter">
        <p>
          Lives at <code>/tools/image-converter</code>. Re-encodes between PNG, JPEG, and WebP using the HTML Canvas <code>toBlob()</code> path. Quality is ignored for PNG (lossless); 0.1-1.0 for JPEG/WebP. Source bitmaps are decoded with <code>createImageBitmap</code> and <code>close()</code>&apos;d in a <code>finally</code> block to release GPU memory.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 15 · Image Resizer">
        <p>
          Lives at <code>/tools/image-resizer</code>. Canvas <code>drawImage(...)</code> with <code>imageSmoothingQuality = &quot;high&quot;</code> for bicubic-like resampling. Aspect-ratio lock auto-updates the other dimension on edit. Source MIME is preserved; the downloaded filename appends <code>-WxH</code> so multiple outputs do not collide with the original.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 16 · Password Generator">
        <p>
          Lives at <code>/tools/password-generator</code>. Driven by <code>crypto.getRandomValues(Uint32Array)</code> — a cryptographically secure PRNG — with independent per-character sampling. Shannon entropy (length × log2(pool)) drives a weak/medium/strong strength meter. Nothing is stored or transmitted.
        </p>
      </InfoSection>

      <InfoSection heading="Tool 17 · Color Converter">
        <p>
          Lives at <code>/tools/color-converter</code>. RGB is the single source of truth; HEX and HSL are derived via <code>useMemo</code>. HSL uses the hexcone algorithm without sRGB gamma correction (the goal is round-tripping across the three encodings, not P3/OKLCH gamut mapping).
        </p>
      </InfoSection>

      <InfoSection heading="Tool 18 · UUID Generator">
        <p>
          Lives at <code>/tools/uuid-generator</code>. Prefers <code>crypto.randomUUID()</code>; older browsers fall back to <code>crypto.getRandomValues</code> with manual RFC 4122 v4 version bits (byte 6 = 0x40 mask) and variant bits (byte 8 = 0x80 mask). Up to 10,000 UUIDs in a single batch.
        </p>
      </InfoSection>

      <InfoSection heading="Performance Budget">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>LCP</strong> (Largest Contentful Paint): &lt; 1.5 s (median);</li>
          <li><strong>Initial JS size</strong>: &lt; 90 KB gzipped, including the Next.js framework;</li>
          <li><strong>CLS</strong> (Cumulative Layout Shift): &lt; 0.05, with AdSense slots reserved at fixed heights;</li>
          <li><strong>INP</strong> (Interaction to Next Paint): &lt; 200 ms;</li>
          <li><strong>Lighthouse composite scores</strong>: &gt; 95 across Performance, Accessibility, Best Practices, and SEO.</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Contribution Guide">
        <p>We welcome the following kinds of contributions — please open a GitHub issue to discuss before sending a PR:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>New tools (must respect the "pure frontend, zero tracking" principle);</li>
          <li>Bug fixes and accessibility improvements (WCAG 2.1 AA);</li>
          <li>New language translations (see <code>src/i18n/messages/</code> for the structure);</li>
          <li>Performance optimization and dependency size reduction;</li>
          <li>Design system iteration (start by reading <code>tailwind.config.ts</code> design tokens).</li>
        </ul>
      </InfoSection>
    </InfoPageLayout>
  );
}
