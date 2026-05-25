import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · XLSX → PDF/A PIPELINE",
  title: "Behind the five-second guarantee: server-side LibreOffice Calc in a memory-only pipeline",
  lead:
    "Converting a .xlsx to a PDF sounds trivial — until you have to do it for thousands of users without storing a byte to disk, without leaking financial metadata, and inside a hard five-second budget. This is the engineering story behind the All-in-One Toolbox Excel → PDF surface, one of the two server-backed paths on the site.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Office Open XML Spreadsheet (.xlsx) and the PDF family of standards live in different worlds. One is editable, formula-driven, and constantly recomputed; the other is a frozen artefact for distribution and archiving. Understanding why both still exist is the first step to picking a conversion strategy that survives real-world workbooks.",
      subsections: [
        {
          heading: "Office Open XML Spreadsheet (ECMA-376 / ISO/IEC 29500)",
          paragraphs: [
            "The .xlsx format you upload here is a ZIP archive whose internal members are XML files describing worksheets, cell ranges, named formulas, chart definitions, shared strings, and per-cell formatting. It was standardised as ECMA-376 in 2006, ratified as ISO/IEC 29500 in 2008, and is now the universal interchange container for spreadsheet data — emitted by Microsoft Excel, Apple Numbers export, Google Sheets export, LibreOffice Calc, and dozens of headless engines.",
            "Because OOXML Spreadsheet preserves live formulas and structured data, it carries volumes of dynamic content that PDFs cannot: dependency graphs across sheets, conditional formatting rules, data validation constraints, pivot table caches, and external workbook links. Each of these is a potential interoperability minefield: two engines may resolve the same `VLOOKUP` chain against different locale settings, particularly for date arithmetic or text-to-number coercion.",
            "Any sane conversion strategy therefore reuses an existing trustworthy OOXML reader rather than re-implementing the spec. We chose LibreOffice Calc — the same engine that powers millions of desktop workbooks — and ran it headlessly inside Gotenberg, a small Go process that exposes LibreOffice and Chromium as an HTTP service.",
          ],
        },
        {
          heading: "PDF/A and the long-term archiving promise",
          paragraphs: [
            "PDF is not one specification but a family. PDF 1.7 (ISO 32000-1) is the everyday format. PDF/A — the archiving subset — strips fonts that cannot be embedded, forbids JavaScript and external dependencies, and embeds all colour profiles directly inside the file. For spreadsheets, this means the page-grid view at conversion time is frozen forever; auditors years later will see the exact same number layout you saw.",
            "Most regulatory regimes that ask for \"digital financial records that will be readable in 20 years\" name PDF/A explicitly: ISO 19005 in standards bodies, MoReq2010 inside the EU, SOX retention rules across U.S. public companies, and the German GoBD rules that govern fiscal record retention. If you intend a converted PDF to satisfy any of those audiences, archival compliance is not optional — it is the only acceptable output.",
            "Our converter targets a PDF/A-compatible profile by default. LibreOffice's PDF export emits a conformant file; embedded fonts are required and we strictly forbid the export of any workbook that depends on locally installed fonts the server does not ship.",
          ],
        },
        {
          heading: "Why this matters for finance, audit, and procurement",
          paragraphs: [
            "Three industries dominate the use-case mix we see in production. Each one carries hard constraints that influenced our design.",
            "First, finance and reporting. Quarterly earnings packs, internal P&L drafts, and budget reconciliations are authored in Excel and distributed as PDF. Conversion fidelity matters because the page break across rows must align to logical group boundaries — splitting a SUM block in half across two pages is a real-world reason exec teams reject converters.",
            "Second, audit and tax. Tax authorities from HMRC (UK) to the IRS (US) to the SAT (Mexico) increasingly accept PDF/A as the canonical record format for spreadsheets attached to filings. A subtle bug — a column that re-flows, a header that drops on page two — can shift cell references cited inside accompanying narratives and invalidate the filing.",
            "Third, procurement and pricing. RFP responses, bid tabulations, and price lists are almost always created in Excel and circulated as PDF to lock the numbers. The European GDPR and similar regimes require that personally identifiable information transmitted between systems be transported under strict minimisation rules. Holding a workbook with supplier bank details on a converter's disk for even ninety seconds is enough to require a Data Processing Agreement. Our memory-only pipeline removes that classification entirely.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "The five-second guarantee is the user-visible contract. The engineering inside that envelope is more interesting: a six-stage memory-only pipeline that touches disk nowhere, sandboxes LibreOffice Calc in a process tree we control, and refuses to start work it cannot finish.",
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
            "Gotenberg itself maintains a LibreOffice process pool. Each conversion spawns a fresh `soffice.bin --headless --convert-to pdf` subprocess to ensure that a malformed workbook — and they happen, particularly ones with circular formula references — cannot corrupt state shared with the next request.",
          ],
        },
        {
          heading: "Stage 5 — The five-second hard deadline",
          paragraphs: [
            "The headline guarantee is enforced at two layers. First, `asyncio.wait_for(httpx_call, timeout=5.0)` cancels the outbound RPC if Gotenberg has not delivered the response by the deadline. Second, Gotenberg itself enforces a per-conversion `LIBREOFFICE_RESTART_AFTER` and `--libreoffice-restart-after` to ensure a single rogue conversion cannot wedge the pool.",
            "When the deadline trips, we send `SIGTERM` to the LibreOffice subprocess and respond to the client with `504 Gateway Timeout`. The frontend translates the 504 into a friendly \"Server is busy\" toast with a suggestion to retry with a smaller workbook.",
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
        "Most conversion failures fall into a small number of predictable buckets. Working through the common categories below will solve the overwhelming majority of issues. Edge cases — particularly extremely wide spreadsheets or pivot-heavy workbooks — sometimes need a desktop pre-conversion step that the browser cannot perform.",
      subsections: [
        {
          heading: "Why does my PDF cut columns off the right side of the page?",
          paragraphs: [
            "Almost certainly your worksheet has no print area defined and the natural column width exceeds an A4 portrait page. LibreOffice Calc honours the same print settings Excel uses — if you have not configured \"Fit to one page wide\" or set an explicit print area, you will get the default behaviour: columns flow until they overflow, and the overflow becomes additional pages on the right.",
            "The fix is in the source workbook before uploading: in Microsoft Excel, navigate to Page Layout → Scale to Fit → Width: 1 page, or set Page Layout → Print Area → Set Print Area on the range you want printed. Switching to landscape orientation in Page Setup also buys you ~40% more horizontal room. The resulting .xlsx will convert with the layout you actually want.",
          ],
        },
        {
          heading: "The conversion times out at exactly five seconds. What now?",
          paragraphs: [
            "Five seconds is enough for a 5 MB workbook with ordinary formulas. The cases that exceed the budget almost always share one of three traits: thousands of live formula cells with cross-sheet dependencies, dozens of embedded charts with high-resolution underlying datasets, or pivot tables backed by external workbook links.",
            "Convert formulas to values before uploading (copy → paste special → values) wherever you do not need the formulas preserved. Replace SmartArt or chart objects with rasterised PNG images. If your workbook is genuinely large (dozens of sheets with millions of cells), split it into per-sheet workbooks and convert each separately, then concatenate the PDFs using our PDF Merge & Split tool.",
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
          heading: "My .xls (legacy binary, pre-2007) returns 415 Unsupported Media Type",
          paragraphs: [
            "Our gateway validates the OOXML magic-bytes (`50 4B 03 04`). True legacy .xls files use the older OLE2 compound document format whose magic is `D0 CF 11 E0`. We accept that magic too, but a fraction of files in the wild are actually mis-named .xls files whose contents are CSV or HTML — those will be rejected at the magic-byte stage.",
            "If you have a real legacy binary that fails for an obvious reason — for example, password-protected or containing deprecated XLM macros — open it in any modern editor, remove the protection, and re-save as .xlsx. The 2007 OOXML container ships with stronger compression and uniform schema, and our pipeline handles it with much better fidelity than the legacy OLE2 compound document format.",
          ],
        },
        {
          heading: "Best-practice checklist before uploading",
          paragraphs: [
            "These five steps eliminate roughly 90% of fidelity issues. They take less than thirty seconds combined and they have no downside.",
          ],
        },
      ],
      bullets: [
        "Set a print area and enable \"Fit to one page wide\" before uploading — overflow columns become extra pages otherwise.",
        "Convert volatile formulas (NOW, RAND, INDIRECT) to values — they are recomputed differently inside LibreOffice Calc.",
        "Rasterise embedded charts to PNG if exact pixel fidelity matters — vector chart redraw varies between engines.",
        "Strip VBA macros — they are stripped automatically during conversion since PDF does not support them.",
        "Re-save once with \"Save As → Excel Workbook (.xlsx)\" to flush a clean OOXML envelope before uploading.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · XLSX → PDF/A 管线",
  title: "5 秒承诺背后的工程：内存级 LibreOffice Calc 隔离流水线",
  lead:
    "把一份 .xlsx 转成 PDF 看起来很简单——直到你需要为成千上万的用户每天做这件事，并且整个过程不允许任何字节落盘、不允许泄漏财务元数据、必须卡在 5 秒硬上限之内。下面是 All-in-One Toolbox 上两条涉及后端的链路之一——Excel → PDF 工具背后的全部工程细节。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "Office Open XML Spreadsheet（也就是你上传的 .xlsx 容器）和 PDF 家族属于完全不同的两个世界：一边是可编辑、公式驱动、随时重算的活态数据；另一边是冻结的分发与归档产物。理解它们各自为什么仍然存在，是为真实世界的工作簿挑选正确的转换策略的第一步。",
      subsections: [
        {
          heading: "Office Open XML Spreadsheet（ECMA-376 / ISO/IEC 29500）",
          paragraphs: [
            "你这里上传的 .xlsx 本质是一个 ZIP 归档，里面成员是若干 XML 文件，描述了工作表、单元格区域、命名公式、图表定义、共享字符串、以及每个单元格的格式化信息。它在 2006 年作为 ECMA-376 完成标准化，2008 年通过 ISO/IEC 29500 国际标准化，今天已经是电子表格数据跨平台交换的通用容器——Microsoft Excel、Apple Numbers 导出、Google Sheets 导出、LibreOffice Calc 以及大量无头引擎都会输出 .xlsx。",
            "因为 OOXML Spreadsheet 保留了「活的」公式和结构化数据，它内含远比 PDF 多的动态内容：跨工作表的依赖图、条件格式规则、数据验证约束、数据透视缓存、以及指向外部工作簿的链接。任何一条都可能成为兼容性陷阱：两套引擎在不同 locale 设置下对同一条 `VLOOKUP` 链可能给出不同结果，尤其是日期算术或者文本与数字之间的隐式转换。",
            "合理的转换策略，应该复用一套被信任的成熟 OOXML 解析引擎，而不是自己重新实现规范。我们选择了 LibreOffice Calc——驱动着数百万桌面工作簿的同一套引擎，并在 Gotenberg 内以无头模式运行。Gotenberg 是一个轻量 Go 进程，把 LibreOffice 和 Chromium 包装成 HTTP 服务。",
          ],
        },
        {
          heading: "PDF/A 与「20 年仍可读」的长期归档承诺",
          paragraphs: [
            "PDF 并不是一个规范，而是一族。PDF 1.7（ISO 32000-1）是日常用的「普通 PDF」。PDF/A 是其归档子集：它强制嵌入所有字体、禁止 JavaScript 与外部依赖、要求所有颜色配置文件嵌在文件内部。对工作簿而言，这意味着转换时刻的「页面网格视图」会被永久冻结：未来若干年里，审计员看到的数字排版与你当时所见完全一致。",
            "几乎所有要求「这份电子财务记录二十年后仍可读」的法规，都会显式点名 PDF/A：标准化组织的 ISO 19005、欧盟内部的 MoReq2010、美国上市公司的 SOX 留存规则、德国财政记录保留的 GoBD。如果你打算让转换后的 PDF 通过这些审计，归档合规就不是可选项，而是唯一可接受的输出。",
            "我们的转换器默认输出 PDF/A 兼容轮廓。LibreOffice 的 PDF 导出会生成合规文件；嵌入字体被强制要求，并且我们严格拒绝那些依赖本地字体但服务器没有装的导出。",
          ],
        },
        {
          heading: "为什么这对财务、审计、采购三类业务特别重要",
          paragraphs: [
            "在生产环境我们看到三大行业使用频次最高，每个行业又各自带着会显著影响设计的硬约束。",
            "第一，财务与报表。季度业绩包、内部 P&L 草稿、预算对账，都是在 Excel 中起草，最终以 PDF 分发。转换保真度因此格外重要：跨行的分页必须落在合理的逻辑分组边界——把一整块 SUM 拦腰切到两页，是高管团队拒绝接受转换器的真实理由。",
            "第二，审计与税务。从英国 HMRC、美国 IRS 到墨西哥 SAT，越来越多的税务机关把 PDF/A 视为附加电子表格的标准存档格式。一个看似微不足道的 bug——一列在分页时折行、表头在第二页消失——就足以让附带说明里引用的单元格坐标失效，进而让申报材料被退回。",
            "第三，采购与定价。RFP 应标、报价比对、价目表，几乎都是在 Excel 里制作，再以 PDF 形式流转以「锁数字」。GDPR 等隐私法规要求在系统之间传递的个人身份信息必须遵守严格的「最小化」原则。一份带供应商银行账号的工作簿如果在转换服务的磁盘上停留哪怕九十秒，就足够把这条链路升级为需要 DPA（数据处理协议）才能上线的高风险流程。我们的纯内存管道直接把这一分类从问题清单上消除。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "5 秒承诺是面向用户可见的契约，但承诺背后的工程更有意思：一条六阶段、全程纯内存、磁盘零落地的隔离流水线，把 LibreOffice Calc 关进我们能够控制的进程树里，并拒绝接下任何完成不了的活。",
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
            "Gotenberg 内部维护一个 LibreOffice 进程池。每一次转换都会拉起一个全新的 `soffice.bin --headless --convert-to pdf` 子进程，保证一份畸形工作簿——尤其是带循环公式引用的——不会污染下一次请求所需的共享状态。",
          ],
        },
        {
          heading: "阶段 5 · 5 秒硬性截止线",
          paragraphs: [
            "「5 秒承诺」由两层一起兜底。第一层在 Python 这边：`asyncio.wait_for(httpx_call, timeout=5.0)` 会在到点未收到响应时强制取消对 Gotenberg 的远程调用。第二层在 Gotenberg 本身：通过 `LIBREOFFICE_RESTART_AFTER` 和 `--libreoffice-restart-after`，保证哪怕单个失控的转换也不会卡死整个进程池。",
            "截止线触发时，我们会向 LibreOffice 子进程发送 `SIGTERM` 并向客户端回 `504 Gateway Timeout`。前端会把这个 504 翻译成一条友好的「服务器繁忙」提示，并建议用户换一个更小的工作簿再试。",
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
        "大多数转换失败都落在为数不多的几个可预测的桶里。下面这几类是覆盖率最高的常见问题，按顺序处理，能解决绝大多数情况。某些极端工作簿——特别是极宽的表格或者重度依赖数据透视的——可能确实需要先在桌面端做一次预处理，浏览器替你做不了。",
      subsections: [
        {
          heading: "为什么 PDF 把页面右侧的列截断了？",
          paragraphs: [
            "几乎可以肯定你的工作表没有设置打印区域，而自然列宽超过了 A4 纵向页面的尺寸。LibreOffice Calc 完全遵守 Excel 同样的打印设置——如果你没有配置「调整为 1 页宽」或者显式设置打印区域，得到的就是默认行为：列一直向右流动，溢出的列变成右侧额外的页。",
            "解决办法是在源工作簿上做调整：在 Microsoft Excel 中进入 页面布局 → 缩放比例 → 宽度：1 页，或者通过 页面布局 → 打印区域 → 设置打印区域 选定你想打印的范围。把纸张方向改为横向也能多出约 40% 的横向空间。这样导出的 .xlsx 转换出来的版面就是你想要的。",
          ],
        },
        {
          heading: "转换刚好卡在 5 秒超时，怎么办？",
          paragraphs: [
            "对 5 MB 以下且公式常规的工作簿，5 秒预算完全够用。会触发超时的工作簿大都有以下三种特征之一：成千上万的活公式单元格 + 跨表依赖、几十个内嵌图表且每个图表底层数据集都是高分辨率、或者数据透视表底层挂着外部工作簿链接。",
            "请上传前先把不需要保留为公式的区域「复制 → 选择性粘贴 → 数值」转为静态值。把 SmartArt 或图表对象替换成栅格化的 PNG 图像。如果你的工作簿确实很大（几十个工作表加几百万单元格），请先按工作表拆分逐份转换，再用我们的 PDF 合并与拆分工具一次性拼回去。",
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
          heading: "我的 .xls（2007 之前的二进制格式）被 415 拒绝",
          paragraphs: [
            "我们的网关校验 OOXML 的魔术字节 `50 4B 03 04`。真正的旧版 .xls 使用更早的 OLE2 compound document 格式，魔术是 `D0 CF 11 E0`，我们也接受。但实际上有相当一部分被命名为 .xls 的文件其实是被错命名的 CSV 或 HTML，这些会在魔术字节阶段就被拒。",
            "如果你拿到的是真正的旧版二进制并且确实有原因失败——比如被密码保护、或包含已废弃的 XLM 宏——请在任何一个现代编辑器里打开、解除保护、另存为 .xlsx。2007 之后的 OOXML 容器有更好的压缩与统一 schema，我们的管线对它的保真度也比对 OLE2 高得多。",
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
        "上传前设置好打印区域并开启「调整为 1 页宽」——否则溢出的列会变成额外的页。",
        "把易失公式（NOW、RAND、INDIRECT）转换为静态值——它们在 LibreOffice Calc 里的重算结果可能不同。",
        "如果对像素级保真度有要求，请把嵌入图表先栅格化为 PNG——不同引擎的矢量重绘可能略有差异。",
        "剥离 VBA 宏——它们在转换时会被自动剥离，因为 PDF 格式不支持。",
        "上传前用「另存为 → Excel 工作簿 (.xlsx)」再保存一次，刷新出干净的 OOXML 信封。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
