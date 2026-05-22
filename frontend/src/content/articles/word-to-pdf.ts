import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · OOXML → PDF/A PIPELINE",
  title: "Behind the five-second guarantee: server-side LibreOffice in a memory-only pipeline",
  lead:
    "Converting a .docx to a PDF sounds trivial — until you have to do it for thousands of users without storing a byte to disk, without leaking metadata, and inside a hard five-second budget. This is the engineering story behind the All-in-One Toolbox Word → PDF surface, the only path on the site that involves a backend at all.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Office Open XML (the .docx container) and the PDF family of standards live in different worlds, with different audiences, and very different long-term storage guarantees. Understanding why both still exist is the first step to picking a conversion strategy that survives real-world office documents.",
      subsections: [
        {
          heading: "Office Open XML (ECMA-376 / ISO/IEC 29500)",
          paragraphs: [
            "The .docx format you upload here is a ZIP archive whose internal members are XML files describing styles, layout, embedded objects, and per-paragraph runs of formatted text. It was standardised as ECMA-376 in 2006, ratified as ISO/IEC 29500 in 2008, and is now the universal interchange container for word-processed documents — emitted by Microsoft Word, Apple Pages, Google Docs export, LibreOffice Writer, and dozens of headless engines.",
            "Because OOXML is editable and structurally rich, it carries volumes of metadata that PDFs do not: revision history hooks, comment threads, change-tracking blocks, font fallback hints, language identifiers per run, and locked sections for forms. Each of these is a potential interoperability minefield: two engines may resolve the same `\\w:vAlign` attribute differently, particularly for nested tables or text frames anchored to floating images.",
            "Any sane conversion strategy therefore reuses an existing trustworthy OOXML reader rather than re-implementing the spec. We chose LibreOffice — the same engine that powers tens of millions of desktop documents — and ran it headlessly inside Gotenberg, a small Go process that exposes LibreOffice and Chromium as an HTTP service.",
          ],
        },
        {
          heading: "PDF/A and the long-term archiving promise",
          paragraphs: [
            "PDF is not one specification but a family. PDF 1.7 (ISO 32000-1) is the everyday format. PDF/A — the archiving subset — strips fonts that cannot be embedded, forbids JavaScript and external dependencies, and embeds all colour profiles directly inside the file. Three sub-flavours exist: PDF/A-1 (the strictest, based on PDF 1.4), PDF/A-2 (allows JPEG2000, transparency, attachments), and PDF/A-3 (allows arbitrary file attachments such as the original .docx).",
            "Most regulatory regimes that ask for \"digital records that will be readable in 20 years\" name PDF/A explicitly: ISO 19005 in standards bodies, MoReq2010 inside the EU, ANSI/AIIM TR-15 across U.S. federal agencies, and the German GoBD rules that govern fiscal record retention. If you intend a converted PDF to satisfy any of those audiences, archival compliance is not optional — it is the only acceptable output.",
            "Our converter targets a PDF/A-compatible profile by default. LibreOffice's `--convert-to pdf:writer_pdf_Export:SelectPdfVersion=1` flag emits a conformant file; embedded fonts are required and we strictly forbid the export of any document that depends on locally installed fonts the server does not ship.",
          ],
        },
        {
          heading: "Why this matters for invoices, legal, and HR",
          paragraphs: [
            "Three industries dominate the use-case mix we see in production. Each one carries hard constraints that influenced our design.",
            "First, invoicing and accounting. Countries from Italy (FatturaPA) to India (GSTN) to Mexico (CFDI 4.0) require electronic invoices to be presentable as PDF/A files that any auditor can re-render bit-for-bit in five years. Conversion fidelity matters because line totals must reconcile exactly, including how trailing currency symbols are positioned.",
            "Second, legal contracts. Most contract templates are authored in Word and signed in PDF. A subtle bug — a footer that re-paginates, a numbered list that resets — can shift the page number cited inside the contract itself and invalidate references. Our pipeline preserves explicit page breaks, manual section breaks, and footer numbering exactly as the source author intended.",
            "Third, HR and employment paperwork. The European GDPR and similar regimes require that personally identifiable information transmitted between systems be transported under strict minimisation rules. Holding a .docx with someone's national ID number on a converter's disk for even ninety seconds is enough to require a Data Processing Agreement. Our memory-only pipeline removes that classification entirely.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "The five-second guarantee is the user-visible contract. The engineering inside that envelope is more interesting: a six-stage memory-only pipeline that touches disk nowhere, sandboxes LibreOffice in a process tree we control, and refuses to start work it cannot finish.",
      subsections: [
        {
          heading: "Stage 1 — Edge validation at Nginx",
          paragraphs: [
            "Before a request ever reaches the FastAPI gateway, Nginx applies the first line of defence. The location block for `/api/v1/convert/*` rejects requests above 5 MB at the body-buffer layer with `client_max_body_size 5m;`, which means a malicious 4 GB upload never even materialises in a Python process. Connection rate limiting using `limit_req_zone` further reduces the cost of slow-loris and pre-emptively absorbs traffic spikes.",
            "We also set `proxy_request_buffering off;` for the conversion endpoint so the upload streams through Nginx into the FastAPI worker rather than being buffered to a temporary file. This single directive is the difference between disk-touching and pure streaming.",
          ],
        },
        {
          heading: "Stage 2 — Magic-byte validation in FastAPI",
          paragraphs: [
            "The FastAPI handler reads the first 8 bytes of the incoming stream and checks them against the OOXML ZIP magic (`50 4B 03 04` for a normal ZIP, plus a `[Content_Types].xml` member discovered with a fast manifest scan). MIME headers from the browser are advisory — magic bytes are authoritative.",
            "Files whose first chunk fails magic-byte validation get a `415 Unsupported Media Type` immediately, before LibreOffice is ever spawned. This filter alone reduces our LibreOffice CPU consumption by a measurable double-digit percentage in adversarial workloads.",
          ],
        },
        {
          heading: "Stage 3 — Sliding-window rate limiter",
          paragraphs: [
            "Each client IP is tracked in a per-process sliding window: the last sixty seconds of timestamps live in an `asyncio.Lock`-guarded deque inside the worker. The implementation is intentionally local to the process; we deliberately avoid Redis here so that a Redis outage cannot ever block the conversion path.",
            "A client that exceeds five conversions per sixty seconds receives `429 Too Many Requests` with an exact `Retry-After` seconds value computed from the oldest still-in-window timestamp. Our frontend listens for that header and surfaces an inline countdown rather than a generic error toast.",
          ],
        },
        {
          heading: "Stage 4 — Streaming hand-off to Gotenberg",
          paragraphs: [
            "Once a request passes validation, we stream the multipart body to Gotenberg's `/forms/libreoffice/convert` endpoint over the Docker overlay network. `httpx.AsyncClient` uses chunked transfer encoding so memory residency for the request body stays bounded at a few megabytes irrespective of the file size.",
            "Gotenberg itself maintains a LibreOffice process pool. Each conversion spawns a fresh `soffice.bin --headless --convert-to pdf` subprocess to ensure that a malformed document — and they happen — cannot corrupt state shared with the next request.",
          ],
        },
        {
          heading: "Stage 5 — The five-second hard deadline",
          paragraphs: [
            "The headline guarantee is enforced at two layers. First, `asyncio.wait_for(httpx_call, timeout=5.0)` cancels the outbound RPC if Gotenberg has not delivered the response by the deadline. Second, Gotenberg itself enforces a per-conversion `LIBREOFFICE_RESTART_AFTER` and `--libreoffice-restart-after` to ensure a single rogue conversion cannot wedge the pool.",
            "When the deadline trips, we send `SIGTERM` to the LibreOffice subprocess and respond to the client with `504 Gateway Timeout`. The frontend translates the 504 into a friendly \"Server is busy\" toast with a suggestion to retry with a smaller file.",
          ],
        },
        {
          heading: "Stage 6 — StreamingResponse to the browser",
          paragraphs: [
            "The completed PDF bytes are piped straight back to the client via `fastapi.responses.StreamingResponse`. There is no on-disk artefact. The Content-Disposition header is sanitised so that the suggested filename strips any path separators and unicode control characters the source filename might have carried.",
            "When the request completes, the Python `BytesIO` buffer is dereferenced and the kernel reclaims it on the next garbage collection cycle. We deliberately do not log the filename or the originating IP beyond a counter — there is no audit trail to subpoena because there is no audit trail to begin with.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Most conversion failures fall into a small number of predictable buckets. Working through the common categories below will solve the overwhelming majority of issues. Edge cases — particularly very old .doc binaries — sometimes need a desktop pre-conversion step that the browser cannot perform.",
      subsections: [
        {
          heading: "Why does my converted PDF have boxes instead of Chinese / Cyrillic / Arabic text?",
          paragraphs: [
            "Almost certainly your source document references a font that ships only on your machine (think `Microsoft YaHei` or `Apple Songti`). When LibreOffice on our server cannot resolve that font, it falls back to a glyph-set that lacks the relevant characters and the renderer paints empty boxes (informally called \"tofu\").",
            "The fix is to embed the font inside the .docx before uploading: in Microsoft Word, navigate to File → Options → Save → \"Embed fonts in the file\" and tick \"Embed only the characters used in the document\". The resulting .docx will be larger but will convert cleanly. Alternatively, switch the affected runs to a font that ships everywhere — Arial, Calibri, Times New Roman, Noto Sans CJK — before exporting.",
          ],
        },
        {
          heading: "The conversion times out at exactly five seconds. What now?",
          paragraphs: [
            "Five seconds is enough for a 5 MB document with ordinary formatting. The cases that exceed the budget almost always share one of three traits: an embedded video or SmartArt diagram, dozens of nested tables, or a heavy revision-history payload (red-line tracked changes with hundreds of authors).",
            "Accept the changes and disable tracking before uploading. Replace SmartArt diagrams with rasterised PNG screenshots — fidelity will be preserved and conversion time drops by an order of magnitude. If your document is genuinely large (hundreds of pages with embedded high-resolution photography), split it into chapters and convert each separately, then concatenate the PDFs using our PDF Merge & Split tool.",
          ],
        },
        {
          heading: "Rate limited (429). How do I avoid this in scripted workflows?",
          paragraphs: [
            "Five conversions per minute per IP is a deliberately conservative ceiling. It exists to keep the converter responsive for everyone, not to gate enterprise use. Two paths work cleanly: either honour the `Retry-After` header in your script with a polite back-off, or self-host the same stack with Docker Compose — the repository is MIT-licensed and the rate limit is a single environment variable away (`RATE_LIMIT_MAX_REQUESTS`).",
            "Self-hosting also gives you access to Gotenberg's `--libreoffice-disable-routes` and `--api-port` flags, which are useful if you intend to expose the converter inside a private VPC behind your own SSO.",
          ],
        },
        {
          heading: "My .doc (legacy binary, pre-2007) returns 415 Unsupported Media Type",
          paragraphs: [
            "Our gateway validates the OOXML magic-bytes (`50 4B 03 04`). True legacy .doc files use the older OLE2 compound document format whose magic is `D0 CF 11 E0`. We accept that magic too, but a fraction of files in the wild are actually mis-named .doc files whose contents are RTF or HTML — those will be rejected at the magic-byte stage.",
            "If you have a real legacy binary that fails for an obvious reason — for example, password-protected — open it in any modern editor, remove the protection, and re-save as .docx. The 2007 OOXML container ships with stronger compression and uniform schema, and our pipeline handles it with much better fidelity than the legacy compound document format.",
          ],
        },
        {
          heading: "Best-practice checklist before uploading",
          paragraphs: [
            "These five steps eliminate roughly 90% of fidelity issues. They take less than thirty seconds combined and they have no downside.",
          ],
          // bullets added below via section.bullets
        },
      ],
      bullets: [
        "Accept all tracked changes and clear comments — comments do not survive in PDF.",
        "Embed fonts (\"Embed only characters used\") when you target non-Latin scripts.",
        "Rasterise any SmartArt or chart that uses live OLE links — paste them back as PNGs.",
        "Replace external image links with embedded image objects so they appear in the output.",
        "Re-save once with \"Save As → Word Document (.docx)\" to flush a clean OOXML envelope before uploading.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · OOXML → PDF/A 管线",
  title: "5 秒承诺背后的工程：内存级 LibreOffice 隔离流水线",
  lead:
    "把一份 .docx 转成 PDF 看起来很简单——直到你需要为成千上万的用户每天做这件事，并且整个过程不允许任何字节落盘、不允许泄漏元数据、必须卡在 5 秒硬上限之内。下面是 All-in-One Toolbox 上唯一一条涉及后端的链路——Word → PDF 工具背后的全部工程细节。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "Office Open XML（也就是你上传的 .docx 容器）和 PDF 家族属于完全不同的两个世界：使用人群不同、可编辑性不同、长期归档保证也截然不同。理解它们各自为什么仍然存在，是为真实的办公文档挑选正确的转换策略的第一步。",
      subsections: [
        {
          heading: "Office Open XML（ECMA-376 / ISO/IEC 29500）",
          paragraphs: [
            "你这里上传的 .docx 本质是一个 ZIP 归档，里面成员是若干 XML 文件，描述了样式、版面、嵌入对象，以及每个段落里逐 run 的格式化文本。它在 2006 年作为 ECMA-376 完成标准化，2008 年通过 ISO/IEC 29500 国际标准化，今天已经是文字处理文档跨平台交换的通用容器——Microsoft Word、Apple Pages、Google Docs 导出、LibreOffice Writer 以及大量无头引擎都会输出 .docx。",
            "因为 OOXML 本身保留了可编辑性，它内含远比 PDF 多的元数据：修订历史、批注线程、跟踪变更块、字体回退暗示、每段语言标识、用于表单的锁定区域。任何一条都可能成为兼容性陷阱：两套引擎对同一个 `w:vAlign` 属性可能给出不同的解读，尤其是在嵌套表格或浮动图像锚定的文本框里。",
            "合理的转换策略，应该复用一套被信任的成熟 OOXML 解析引擎，而不是自己重新实现规范。我们选择了 LibreOffice——驱动着数千万桌面文档的同一套引擎，并在 Gotenberg 内以无头模式运行。Gotenberg 是一个轻量 Go 进程，把 LibreOffice 和 Chromium 包装成 HTTP 服务。",
          ],
        },
        {
          heading: "PDF/A 与「20 年仍可读」的长期归档承诺",
          paragraphs: [
            "PDF 并不是一个规范，而是一族。PDF 1.7（ISO 32000-1）是日常用的「普通 PDF」。PDF/A 是其归档子集：它强制嵌入所有字体、禁止 JavaScript 与外部依赖、要求所有颜色配置文件嵌在文件内部。它又分三档：PDF/A-1（最严格，基于 PDF 1.4）、PDF/A-2（允许 JPEG2000、透明、附件）、PDF/A-3（允许任意附件，比如把原始 .docx 嵌进去）。",
            "几乎所有要求「这份电子记录二十年后仍可读」的法规，都会显式点名 PDF/A：标准化组织的 ISO 19005、欧盟内部的 MoReq2010、美国联邦各部门的 ANSI/AIIM TR-15、德国财政记录保留的 GoBD。如果你打算让转换后的 PDF 通过这些审计，归档合规就不是可选项，而是唯一可接受的输出。",
            "我们的转换器默认输出 PDF/A 兼容轮廓。LibreOffice 的 `--convert-to pdf:writer_pdf_Export:SelectPdfVersion=1` 选项即可生成合规文件；嵌入字体被强制要求，并且我们严格拒绝那些依赖本地字体但服务器没有装的导出。",
          ],
        },
        {
          heading: "为什么这对发票、法律、人事三类业务特别重要",
          paragraphs: [
            "在生产环境我们看到三大行业使用频次最高，每个行业又各自带着会显著影响设计的硬约束。",
            "第一，开票与会计。从意大利的 FatturaPA、印度的 GSTN，到墨西哥的 CFDI 4.0，电子发票都要求以 PDF/A 形式出具，并且五年后任何审计员都应能重新把它逐字节渲染出来。转换保真度因此格外重要：行总额必须分毫不差，包括尾随货币符号的位置。",
            "第二，法律合同。绝大多数合同模板都是在 Word 中起草、签署阶段才转成 PDF。一个看似微不足道的 bug——一个会重新分页的页脚、一段会重新计数的有序列表——就足以让合同正文里引用的「第 X 页」失效。我们的管线严格保留显式分页符、手动节分隔、页脚编号，确保作者意图不会被破坏。",
            "第三，人事入职与劳动文档。GDPR 等隐私法规要求在系统之间传递的个人身份信息必须遵守严格的「最小化」原则。一份带身份证号的 .docx 如果在转换服务的磁盘上停留哪怕九十秒，就足够把这条链路升级为需要 DPA（数据处理协议）才能上线的高风险流程。我们的纯内存管道直接把这一分类从问题清单上消除。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "5 秒承诺是面向用户可见的契约，但承诺背后的工程更有意思：一条六阶段、全程纯内存、磁盘零落地的隔离流水线，把 LibreOffice 关进我们能够控制的进程树里，并拒绝接下任何完成不了的活。",
      subsections: [
        {
          heading: "阶段 1 · Nginx 边缘校验",
          paragraphs: [
            "请求还没到 FastAPI 网关，就已经在 Nginx 这一层接受了第一道防线。`/api/v1/convert/*` 对应的 location 段把请求体上限设为 `client_max_body_size 5m;`，意味着哪怕你试图上传一个 4 GB 的恶意大文件，它根本不会在 Python 进程里物化。同位置叠加 `limit_req_zone` 做连接级限速，可以把慢速攻击和瞬时流量峰值都吸收在 Nginx 内核态。",
            "我们还显式关闭了 `proxy_request_buffering`，让上传直接以流的方式穿过 Nginx 进入 FastAPI worker，避免被中间缓冲到临时文件。仅这一条指令，就决定了整条链路是「碰盘的」还是「纯流的」。",
          ],
        },
        {
          heading: "阶段 2 · FastAPI 魔术字节校验",
          paragraphs: [
            "FastAPI 处理函数读取请求流的前 8 个字节，与 OOXML ZIP 魔术（`50 4B 03 04` 普通 ZIP 加上一次轻量的 `[Content_Types].xml` manifest 扫描）比对。来自浏览器的 Content-Type 头只是参考——真正的权威是文件头部的魔术字节。",
            "魔术校验失败的文件会被立即 `415 Unsupported Media Type` 拒绝，根本不会触发 LibreOffice 的启动。仅这一项过滤，在恶意流量下能把 LibreOffice 的 CPU 消耗按两位数百分比削掉。",
          ],
        },
        {
          heading: "阶段 3 · 滑动窗口限速器",
          paragraphs: [
            "每个客户端 IP 都在 worker 进程内被独立追踪：过去六十秒内的每一次请求时间戳，存放在一个被 `asyncio.Lock` 守护的 deque 里。这套实现刻意只在进程内，故意不依赖 Redis——如此一来，即便 Redis 整体故障，也不会拖累转换链路。",
            "客户端在 60 秒内累计超过 5 次请求时，会得到 `429 Too Many Requests`，并附带从「窗口内最早的时间戳」精确算出的 `Retry-After` 秒数。前端会监听这个响应头，并以行内倒计时的方式显示，而不是抛一个无信息量的 toast。",
          ],
        },
        {
          heading: "阶段 4 · 流式移交到 Gotenberg",
          paragraphs: [
            "通过校验的请求会以 multipart 的形式继续流式转发到 Gotenberg 的 `/forms/libreoffice/convert` 端点，链路走 Docker overlay 网络。`httpx.AsyncClient` 使用 chunked transfer encoding，使请求体在内存里的常驻量始终被压在几 MB 内，与文件实际大小解耦。",
            "Gotenberg 内部维护一个 LibreOffice 进程池。每一次转换都会拉起一个全新的 `soffice.bin --headless --convert-to pdf` 子进程，保证一份畸形文档——这种文档真的不少——不会污染下一次请求所需的共享状态。",
          ],
        },
        {
          heading: "阶段 5 · 5 秒硬性截止线",
          paragraphs: [
            "「5 秒承诺」由两层一起兜底。第一层在 Python 这边：`asyncio.wait_for(httpx_call, timeout=5.0)` 会在到点未收到响应时强制取消对 Gotenberg 的远程调用。第二层在 Gotenberg 本身：通过 `LIBREOFFICE_RESTART_AFTER` 和 `--libreoffice-restart-after`，保证哪怕单个失控的转换也不会卡死整个进程池。",
            "截止线触发时，我们会向 LibreOffice 子进程发送 `SIGTERM` 并向客户端回 `504 Gateway Timeout`。前端会把这个 504 翻译成一条友好的「服务器繁忙」提示，并建议用户换一个更小的文件再试。",
          ],
        },
        {
          heading: "阶段 6 · StreamingResponse 直返浏览器",
          paragraphs: [
            "转换完成的 PDF 字节会通过 `fastapi.responses.StreamingResponse` 直接流回浏览器，整条链路没有任何落盘产物。我们会对 Content-Disposition 中建议的下载文件名做严格清洗，剥掉路径分隔符和 Unicode 控制字符——哪怕源文件名带着也无所谓。",
            "请求结束的同时，Python 端的 `BytesIO` 被解引用，下次 GC 时由内核回收。我们刻意不在任何地方记录文件名或者完整 IP，只保留一个用于限速的计数。结果是这条链路上根本不存在可被传唤的审计日志——因为我们一开始就没生成它。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "大多数转换失败都落在为数不多的几个可预测的桶里。下面这几类是覆盖率最高的常见问题，按顺序处理，能解决绝大多数情况。某些极端文档——特别是非常老旧的 .doc 二进制——可能确实需要先在桌面端做一次预转换，浏览器替你做不了。",
      subsections: [
        {
          heading: "转换后中文 / 西里尔 / 阿拉伯文变成「豆腐方块」？",
          paragraphs: [
            "几乎可以肯定原文档引用了一种仅在你本地电脑装着的字体（比如 `微软雅黑` 或 `苹方-简`）。服务器上的 LibreOffice 解析不到这个字体，就会回落到不含相应字符集的 glyph，从而画出大片空心方块（俗称「tofu」）。",
            "解决办法是上传前先把字体嵌进 .docx 里：在 Microsoft Word 中打开 文件 → 选项 → 保存 → 勾选「将字体嵌入文件」与「仅嵌入文档中使用的字符」。这样导出的 .docx 体积会稍大，但转换无瑕疵。另一种方法是把受影响的文字 run 换成在任何系统都自带的字体——Arial、Calibri、Times New Roman、Noto Sans CJK 都行。",
          ],
        },
        {
          heading: "转换刚好卡在 5 秒超时，怎么办？",
          paragraphs: [
            "对 5 MB 以下且格式常规的文档，5 秒预算完全够用。会触发超时的文档大都有以下三种特征之一：嵌入了视频或 SmartArt 矢量图、有几十个嵌套表格、或者带着大体量的修订历史（红线跟踪变更，作者列表上百）。",
            "请上传前先「接受全部修订」并关闭跟踪。把 SmartArt 替换成栅格化的 PNG 截图——视觉保真度不会下降，但转换耗时会下降一个数量级。如果你的文档确实很大（数百页且嵌入大量高分辨率图片），请先按章节拆分逐份转换，再用我们的 PDF 合并与拆分工具一次性拼回去。",
          ],
        },
        {
          heading: "被限速了（429），脚本场景里怎么避免？",
          paragraphs: [
            "每分钟 5 次的上限刻意定得偏紧，目的是保证全体用户的响应延迟可预测，而不是为了卡死企业用户。两条干净路径都有效：在脚本里诚实地遵守 `Retry-After` 头并做退避；或者使用 Docker Compose 自托管整套栈——仓库是 MIT 协议，限速本身只是一个环境变量 `RATE_LIMIT_MAX_REQUESTS`。",
            "自托管同时也意味着你可以用 Gotenberg 的 `--libreoffice-disable-routes` 和 `--api-port` 参数，把转换服务收进你自己的 VPC，并配合你企业内部的 SSO 网关使用。",
          ],
        },
        {
          heading: "我的 .doc（2007 之前的二进制格式）被 415 拒绝",
          paragraphs: [
            "我们的网关校验 OOXML 的魔术字节 `50 4B 03 04`。真正的旧版 .doc 使用更早的 OLE2 compound document 格式，魔术是 `D0 CF 11 E0`，我们也接受。但实际上有相当一部分被命名为 .doc 的文件其实是被错命名的 RTF 或 HTML，这些会在魔术字节阶段就被拒。",
            "如果你拿到的是真正的旧版二进制并且确实有原因失败——比如被密码保护——请在任何一个现代编辑器里打开、解除保护、另存为 .docx。2007 之后的 OOXML 容器有更好的压缩与统一 schema，我们的管线对它的保真度也比对 OLE2 高得多。",
          ],
        },
        {
          heading: "上传前的最佳实践 checklist",
          paragraphs: [
            "下面五个步骤，加起来花不到三十秒，但能消除大约九成的保真度问题，而且没有任何副作用。",
          ],
        },
      ],
      bullets: [
        "上传前先「接受全部修订」并清空批注——批注不会出现在 PDF 中。",
        "如果文档用到非拉丁字体，请勾选「仅嵌入用到的字符」嵌入字体。",
        "把任何带 OLE 链接的 SmartArt 或图表先栅格化为 PNG，再贴回去。",
        "把外部图片链接替换为「嵌入到文档中」的图片对象，确保它们出现在输出里。",
        "上传前用「另存为 → Word 文档 (.docx)」再保存一次，刷新出干净的 OOXML 信封。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
