import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · PPTX → PDF/A PIPELINE",
  title: "Five seconds from slide deck to archival PDF: server-side LibreOffice Impress in a memory-only pipeline",
  lead:
    "A PowerPoint deck looks like a simple thing — a stack of slides. Then you push it through a converter at scale and you discover what is actually inside: embedded fonts, vector shapes, rasterised charts, master slides, animations, transitions, embedded video posters, locale-sensitive number formats, and a dozen ways a single slide can break the page. This is the engineering story behind the All-in-One Toolbox PowerPoint → PDF surface, the second server-backed path on the site after Excel → PDF.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Office Open XML Presentation (.pptx) and the PDF family of standards are siblings of the spreadsheet pair, but the failure modes are completely different. A spreadsheet is data trying to look like a document; a presentation is design trying to look like data. Understanding what gets preserved — and what gets quietly stripped — is the difference between a converter that ships and a converter that gets blamed for missing speaker notes.",
      subsections: [
        {
          heading: "Office Open XML Presentation (ECMA-376 / ISO/IEC 29500-1)",
          paragraphs: [
            "The .pptx file you upload here is a ZIP archive whose internal members are XML files describing slides, slide layouts, slide masters, theme definitions, embedded media, and a relationship graph that ties them all together. It was standardised alongside .xlsx as ECMA-376 in 2006 and ratified as ISO/IEC 29500-1 in 2008. Today it is the universal interchange container for presentations — emitted by Microsoft PowerPoint, Apple Keynote export, Google Slides export, LibreOffice Impress, and a long tail of headless renderers.",
            "Because OOXML Presentation preserves design intent — typography, alignment, gradients, master inheritance — it carries volumes of information that PDF only sees once it is collapsed. Each slide can inherit from layouts, layouts can inherit from masters, masters can reference shared themes, and themes carry both colour palettes and font scheme pairs. A naive renderer that does not resolve this inheritance chain will produce slides that look correct in isolation but inconsistent across the deck.",
            "Any serious conversion strategy therefore reuses a battle-tested OOXML reader rather than re-implementing the spec. We chose LibreOffice Impress — the same engine that powers millions of desktop decks — and ran it headlessly inside Gotenberg, the same Go process that fronts our Excel and Word converters.",
          ],
        },
        {
          heading: "PDF/A and the long-term archiving promise for slide decks",
          paragraphs: [
            "PDF is not one specification but a family. PDF 1.7 (ISO 32000-1) is the everyday format. PDF/A — the archiving subset — strips features that cannot be self-contained: external fonts, JavaScript, transparency that depends on the host renderer, and live media. For decks, this means that the rasterised state at conversion time is frozen forever; an auditor opening the file a decade later sees the exact slide your CEO presented.",
            "Most regulatory regimes that demand long-term retention of presentations name PDF/A explicitly: ISO 19005 in standards bodies, MoReq2010 inside the EU, FDA 21 CFR Part 11 for pharmaceutical training records, and the German GoBD rules for fiscal-relevant documentation. Conference proceedings, training certifications, board pack archives, and clinical investigator brochures all live or die by archival conformance.",
            "Our converter targets a PDF/A-compatible profile by default. LibreOffice's PDF export emits a conformant file, embedded fonts are required, and the server ships only fonts whose licences allow embedding into archival documents.",
          ],
        },
        {
          heading: "Why this matters for training, sales, and conference workflows",
          paragraphs: [
            "Three workflows dominate the use-case mix we see in production. Each one carries hard constraints that shaped our design choices.",
            "First, internal training decks. Onboarding curricula, compliance refreshers, security awareness modules, and product training are authored in PowerPoint and distributed as PDF to learner LMSes. Conversion fidelity matters because corporate brand guidelines specify exact colour values, exact font weights, and exact logo placement — and the L&D team will notice if any of those drift.",
            "Second, client pitches and sales decks. Quarterly business reviews, RFP responses, partner enablement decks, and investor materials are circulated as PDF specifically to lock the design and prevent recipients from editing the numbers. A deck that re-flows on a customer's screen because their Office had a different default font is a credibility problem, not a typography problem.",
            "Third, conference talks and academic posters. Speakers submit slide decks weeks in advance; conference organisers convert to PDF for the proceedings record, for accessibility tooling, and for distribution to attendees who could not be in the room. Speaker notes — the field most likely to contain unflattering rehearsal markup — need a clear policy on whether they survive the export. Our converter follows LibreOffice Impress's defaults: notes are stripped unless the export profile explicitly preserves them.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "The five-second guarantee is the user-visible contract. The engineering inside that envelope is more interesting: a six-stage memory-only pipeline that touches disk nowhere, sandboxes LibreOffice Impress in a process tree we control, and refuses to start work it cannot finish.",
      subsections: [
        {
          heading: "Stage 1 — Edge validation at Nginx",
          paragraphs: [
            "Before a request ever reaches the FastAPI gateway, Nginx applies the first line of defence. The location block for `/api/v1/convert/*` rejects requests above 5 MB at the body-buffer layer with `client_max_body_size 5m;`, which means a malicious 4 GB upload never even materialises in a Python process. Connection rate limiting via `limit_req_zone` further reduces the cost of slow-loris and pre-emptively absorbs traffic spikes.",
            "We also set `proxy_request_buffering off;` for the conversion endpoint so the upload streams through Nginx into the FastAPI worker rather than being buffered to a temporary file. This single directive is the difference between disk-touching and pure streaming.",
          ],
        },
        {
          heading: "Stage 2 — Magic-byte validation in FastAPI",
          paragraphs: [
            "The FastAPI handler reads the first 8 bytes of the incoming stream and checks them against the OOXML ZIP magic (`50 4B 03 04` for a normal ZIP, plus a fast `[Content_Types].xml` manifest scan to verify the inner type is `presentationml`). MIME headers from the browser are advisory — magic bytes plus content-type sniffing are authoritative.",
            "Files whose first chunk fails magic-byte validation get a `415 Unsupported Media Type` immediately, before LibreOffice is ever spawned. This filter alone reduces our LibreOffice CPU consumption by a measurable double-digit percentage in adversarial workloads. A bonus: it also catches the depressingly common case where a user renames a .key (Keynote) file to .pptx hoping the converter will understand it.",
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
            "Gotenberg itself maintains a LibreOffice process pool. Each conversion spawns a fresh `soffice.bin --headless --convert-to pdf` subprocess to ensure that a malformed deck — and they happen, particularly ones with corrupted master slide references or circular layout inheritance — cannot corrupt state shared with the next request.",
          ],
        },
        {
          heading: "Stage 5 — The five-second hard deadline",
          paragraphs: [
            "The headline guarantee is enforced at two layers. First, `asyncio.wait_for(httpx_call, timeout=5.0)` cancels the outbound RPC if Gotenberg has not delivered the response by the deadline. Second, Gotenberg itself enforces a per-conversion `LIBREOFFICE_RESTART_AFTER` and `--libreoffice-restart-after` to ensure a single rogue conversion cannot wedge the pool.",
            "When the deadline trips, we send `SIGTERM` to the LibreOffice subprocess and respond to the client with `504 Gateway Timeout`. The frontend translates the 504 into a friendly \"Server is busy\" toast with a suggestion to retry with a smaller deck — almost always by removing embedded video tracks or large bitmap backgrounds.",
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
        "Most conversion failures fall into a small number of predictable buckets. Working through the common categories below will solve the overwhelming majority of issues. Edge cases — particularly decks with extensive video embeds or custom typography — sometimes need a desktop pre-conversion step that the browser cannot perform.",
      subsections: [
        {
          heading: "My animations and slide transitions are gone in the PDF",
          paragraphs: [
            "This is expected, not a bug. PDF is a static format and cannot represent animations, slide transitions, embedded video playback, or audio. During conversion, each slide is rendered to its final visual state: any \"appear on click\" element is shown in full, transition effects are stripped entirely, and embedded video frames are reduced to their poster image (the first frame, or the explicit poster image you set in PowerPoint's Video Tools).",
            "If you need the dynamic behaviour preserved, PDF is not the right output format — consider exporting to MP4 video from PowerPoint instead, or distributing the original .pptx with a viewer that can play the animations. If you only need a static print-ready record, the static rendering is exactly what you want.",
          ],
        },
        {
          heading: "Why do my fonts look different in the PDF?",
          paragraphs: [
            "Almost always font substitution. PowerPoint resolved your deck against the fonts installed on your local machine; LibreOffice Impress on our server resolves it against the fonts shipped with the container image. If your deck uses a font the server does not have (corporate licensed fonts, Adobe Fonts via Creative Cloud, or Microsoft-only stack like Calibri Light variants), LibreOffice substitutes the nearest available — and the substitute almost never matches metrics exactly.",
            "The fix lives in the source deck: in PowerPoint, navigate to File → Options → Save → \"Embed fonts in the file\" and check \"Embed only the characters used in the presentation (best for reducing file size).\" The fonts will travel inside the .pptx, LibreOffice Impress will use them at conversion time, and the resulting PDF will render with your intended typography. This is the single biggest fidelity win available, and it costs nothing.",
          ],
        },
        {
          heading: "The conversion times out at exactly five seconds",
          paragraphs: [
            "Five seconds is enough for a 5 MB deck with ordinary content. The cases that exceed the budget almost always share one of three traits: dozens of high-resolution embedded images that LibreOffice must rasterise per slide, embedded video tracks that LibreOffice tries to extract a poster frame from, or hundreds of slides with deep master-layout inheritance.",
            "Compress images via PowerPoint's Picture Format → Compress Pictures and choose 150 ppi (print quality) or 96 ppi (screen quality) before uploading. Remove or replace embedded video with a static poster image plus a hyperlink to the hosted video URL. If the deck is genuinely long (100+ slides), split it into chapters by section break, convert each chunk separately, and merge the resulting PDFs using our PDF Merge & Split tool.",
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
          heading: "My legacy .ppt (pre-2007 binary format) returns 415 Unsupported Media Type",
          paragraphs: [
            "Our gateway validates the OOXML magic-bytes (`50 4B 03 04`). True legacy .ppt files use the older OLE2 compound document format whose magic is `D0 CF 11 E0` — we accept that magic too, but a fraction of files in the wild are actually mis-named .ppt files whose contents are exported HTML or rasterised image sequences. Those will be rejected at the magic-byte stage.",
            "If you have a real legacy binary that fails for an obvious reason — password protection, deprecated macro modules, or a corrupted master slide — open it in modern PowerPoint, remove the protection, and re-save as .pptx. The 2007 OOXML container ships with stronger compression and a uniform schema, and our pipeline handles it with much better fidelity than the legacy OLE2 compound document format.",
          ],
        },
        {
          heading: "Best-practice checklist before uploading",
          paragraphs: [
            "These five steps eliminate roughly 90% of fidelity issues. They take less than a minute combined and they have no downside.",
          ],
        },
      ],
      bullets: [
        "Embed fonts in the .pptx (File → Options → Save → Embed fonts in the file) — this is the single biggest fidelity win.",
        "Compress images to 150 ppi via Picture Format → Compress Pictures before uploading — uncompressed photos dominate file size.",
        "Replace embedded video with a poster image plus a hyperlink — LibreOffice spends real time extracting video frames.",
        "Accept that animations and transitions will be stripped — PDF cannot represent them, so render the final state you actually want shown.",
        "Re-save once with \"Save As → PowerPoint Presentation (.pptx)\" before uploading to flush a clean OOXML envelope.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · PPTX → PDF/A 管线",
  title: "5 秒承诺背后的工程:内存级 LibreOffice Impress 隔离流水线",
  lead:
    "PowerPoint 幻灯片乍看是个简单的东西——一摞页。直到你把它放到大规模转换器里跑过一遍,才会真正看到里面是什么:嵌入字体、矢量形状、栅格化图表、母版幻灯片、动画、切换效果、嵌入视频封面、依赖 locale 的数字格式,以及单页能用十几种方式破坏整个版面。下面是 All-in-One Toolbox 上 PowerPoint → PDF 工具背后的全部工程细节——这是继 Excel → PDF 之后,我们站点上第二条涉及后端的转换链路。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "Office Open XML Presentation (.pptx) 与 PDF 家族,是 Excel/PDF 那一对的孪生兄弟——但失败模式完全不一样。电子表格是「数据假装成文档」,演示文稿是「设计假装成数据」。理解什么会被保留、什么会被悄悄剥离,是「能上线的转换器」和「被人甩锅说讲者备注没了」之间唯一的差别。",
      subsections: [
        {
          heading: "Office Open XML Presentation(ECMA-376 / ISO/IEC 29500-1)",
          paragraphs: [
            "你上传的 .pptx 本质是一个 ZIP 归档,里面成员是若干 XML 文件,描述了幻灯片、版式、母版、主题定义、嵌入媒体,以及把它们串在一起的关系图。它与 .xlsx 一同在 2006 年作为 ECMA-376 完成标准化,2008 年通过 ISO/IEC 29500-1 国际标准化。今天它已是演示文稿跨平台交换的通用容器——Microsoft PowerPoint、Apple Keynote 导出、Google Slides 导出、LibreOffice Impress 以及一大批无头渲染器都会输出 .pptx。",
            "因为 OOXML Presentation 保留了「设计意图」——字体、对齐、渐变、母版继承——它内含远比 PDF 多的层级信息。每一张幻灯片可以继承自版式,版式可以继承自母版,母版可以引用共享主题,主题同时承载色板和字体方案。一个粗心的渲染器如果不解析这条继承链,得到的结果会是「单张看起来对,但整套不一致」。",
            "认真的转换策略,应该复用一套久经考验的成熟 OOXML 解析引擎,而不是自己重新实现规范。我们选择了 LibreOffice Impress——驱动着数百万桌面演示文稿的同一套引擎,并在 Gotenberg 内以无头模式运行。Gotenberg 同时也是我们 Excel 和 Word 转换器背后的同一个 Go 进程。",
          ],
        },
        {
          heading: "PDF/A 与「20 年仍可读」的长期归档承诺(针对幻灯片)",
          paragraphs: [
            "PDF 并不是一个规范,而是一族。PDF 1.7(ISO 32000-1)是日常用的「普通 PDF」。PDF/A 是其归档子集:它会剥离一切不能自包含的特性——外部字体、JavaScript、依赖宿主渲染器的透明度、活跃的多媒体。对幻灯片而言,这意味着转换时刻的「栅格化状态」会被永久冻结:十年后审计员打开这份文件,看到的就是当年 CEO 现场所讲的那一页。",
            "几乎所有要求长期保存演示文稿的法规都显式点名 PDF/A:标准化组织的 ISO 19005、欧盟内部的 MoReq2010、美国 FDA 21 CFR Part 11(医药行业培训记录)、以及德国财政相关文档保留的 GoBD。会议论文集、培训认证、董事会包归档、临床研究者手册——这些场景的成败,完全取决于归档合规性。",
            "我们的转换器默认输出 PDF/A 兼容轮廓。LibreOffice 的 PDF 导出会生成合规文件,嵌入字体被强制要求,并且服务器只装载那些许可允许嵌入到归档文档里的字体。",
          ],
        },
        {
          heading: "为什么这对培训、销售、会议三类工作流特别重要",
          paragraphs: [
            "在生产环境我们看到三类工作流使用频次最高,每一类又各自带着会显著影响设计的硬约束。",
            "第一,内部培训幻灯片。新员工入职课、合规复训、安全意识模块、产品培训,都是在 PowerPoint 里制作,最终以 PDF 形式分发到学习管理系统(LMS)。转换保真度因此格外重要:公司品牌规范会指定精确的色值、精确的字重、精确的 logo 位置——任何一项漂移,培训部门一眼就能看出来。",
            "第二,客户提案与销售幻灯片。季度业务回顾、RFP 应标、合作伙伴赋能、投资人材料,以 PDF 形式流转的核心目的就是「锁住设计」——防止接收方擅自修改数字。一份在客户屏幕上重排了的幻灯片(因为对方 Office 装的是不同默认字体),这是「可信度问题」,不是「排版问题」。",
            "第三,会议演讲与学术海报。讲者通常提前几周提交幻灯片;会议主办方将其转为 PDF 用于论文集存档、用于无障碍工具读取、以及分发给未能到场的参会者。讲者备注——最可能含有未经润色的彩排批注的那一栏——必须有清晰的策略说明它是否在导出后保留。我们的转换器遵循 LibreOffice Impress 的默认行为:除非导出配置显式要求保留,讲者备注会被剥离。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "5 秒承诺是面向用户可见的契约,但承诺背后的工程更有意思:一条六阶段、全程纯内存、磁盘零落地的隔离流水线,把 LibreOffice Impress 关进我们能够控制的进程树里,并拒绝接下任何完成不了的活。",
      subsections: [
        {
          heading: "阶段 1 · Nginx 边缘校验",
          paragraphs: [
            "请求还没到 FastAPI 网关,就已经在 Nginx 这一层接受了第一道防线。`/api/v1/convert/*` 对应的 location 段把请求体上限设为 `client_max_body_size 5m;`,意味着哪怕你试图上传一个 4 GB 的恶意大文件,它根本不会在 Python 进程里物化。同位置叠加 `limit_req_zone` 做连接级限速,可以把慢速攻击和瞬时流量峰值都吸收在 Nginx 内核态。",
            "我们还显式关闭了 `proxy_request_buffering`,让上传直接以流的方式穿过 Nginx 进入 FastAPI worker,避免被中间缓冲到临时文件。仅这一条指令,就决定了整条链路是「碰盘的」还是「纯流的」。",
          ],
        },
        {
          heading: "阶段 2 · FastAPI 魔术字节校验",
          paragraphs: [
            "FastAPI 处理函数读取请求流的前 8 个字节,与 OOXML ZIP 魔术(`50 4B 03 04` 普通 ZIP 加上一次轻量的 `[Content_Types].xml` manifest 扫描,确认内部类型确实是 `presentationml`)比对。来自浏览器的 Content-Type 头只是参考——真正的权威是文件头部的魔术字节加上内容嗅探。",
            "魔术校验失败的文件会被立即 `415 Unsupported Media Type` 拒绝,根本不会触发 LibreOffice 的启动。仅这一项过滤,在恶意流量下能把 LibreOffice 的 CPU 消耗按两位数百分比削掉。附加好处:它还能拦截一类令人哭笑不得的情况——把 .key (Keynote) 文件改名成 .pptx,然后指望转换器看得懂。",
          ],
        },
        {
          heading: "阶段 3 · 滑动窗口限速器",
          paragraphs: [
            "每个客户端 IP 都在 worker 进程内被独立追踪:过去六十秒内的每一次请求时间戳,存放在一个被 `asyncio.Lock` 守护的 deque 里。这套实现刻意只在进程内,故意不依赖 Redis——如此一来,即便 Redis 整体故障,也不会拖累转换链路。",
            "客户端在 60 秒内累计超过 5 次请求时,会得到 `429 Too Many Requests`,并附带从「窗口内最早的时间戳」精确算出的 `Retry-After` 秒数。前端会监听这个响应头,并以行内倒计时的方式显示,而不是抛一个无信息量的 toast。",
          ],
        },
        {
          heading: "阶段 4 · 流式移交到 Gotenberg",
          paragraphs: [
            "通过校验的请求会以 multipart 的形式继续流式转发到 Gotenberg 的 `/forms/libreoffice/convert` 端点,链路走 Docker overlay 网络。`httpx.AsyncClient` 使用 chunked transfer encoding,使请求体在内存里的常驻量始终被压在几 MB 内,与文件实际大小解耦。",
            "Gotenberg 内部维护一个 LibreOffice 进程池。每一次转换都会拉起一个全新的 `soffice.bin --headless --convert-to pdf` 子进程,保证一份畸形幻灯片——尤其是带损坏的母版引用或循环版式继承的——不会污染下一次请求所需的共享状态。",
          ],
        },
        {
          heading: "阶段 5 · 5 秒硬性截止线",
          paragraphs: [
            "「5 秒承诺」由两层一起兜底。第一层在 Python 这边:`asyncio.wait_for(httpx_call, timeout=5.0)` 会在到点未收到响应时强制取消对 Gotenberg 的远程调用。第二层在 Gotenberg 本身:通过 `LIBREOFFICE_RESTART_AFTER` 和 `--libreoffice-restart-after`,保证哪怕单个失控的转换也不会卡死整个进程池。",
            "截止线触发时,我们会向 LibreOffice 子进程发送 `SIGTERM` 并向客户端回 `504 Gateway Timeout`。前端会把这个 504 翻译成一条友好的「服务器繁忙」提示,并建议用户换一份更小的幻灯片再试——几乎总是通过移除嵌入视频或者大体积位图背景实现。",
          ],
        },
        {
          heading: "阶段 6 · StreamingResponse 直返浏览器",
          paragraphs: [
            "转换完成的 PDF 字节会通过 `fastapi.responses.StreamingResponse` 直接流回浏览器,整条链路没有任何落盘产物。我们会对 Content-Disposition 中建议的下载文件名做严格清洗,剥掉路径分隔符和 Unicode 控制字符——哪怕源文件名带着也无所谓。",
            "请求结束的同时,Python 端的 `BytesIO` 被解引用,下次 GC 时由内核回收。我们刻意不在任何地方记录文件名或者完整 IP,只保留一个用于限速的计数。结果是这条链路上根本不存在可被传唤的审计日志——因为我们一开始就没生成它。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "大多数转换失败都落在为数不多的几个可预测的桶里。下面这几类是覆盖率最高的常见问题,按顺序处理,能解决绝大多数情况。某些极端幻灯片——特别是大量内嵌视频或者使用了定制字体的——可能确实需要先在桌面端做一次预处理,浏览器替你做不了。",
      subsections: [
        {
          heading: "为什么我的动画和切换效果在 PDF 里全没了?",
          paragraphs: [
            "这是预期行为,不是 bug。PDF 是静态格式,无法承载动画、幻灯片切换、嵌入视频播放或者音频。转换时,每张幻灯片会被渲染到它的最终视觉状态:所有「单击出现」的元素被完整展示,切换效果被整体剥离,嵌入视频则被缩减为它的封面帧(第一帧,或者你在 PowerPoint「视频工具」里显式指定的海报图)。",
            "如果你需要保留这些动态行为,PDF 不是正确的输出格式——可以考虑改用 PowerPoint 直接导出为 MP4 视频,或者分发原始 .pptx 给能播动画的查看器。如果你只需要一份静态可打印的存档,那么这个静态渲染恰恰就是你想要的。",
          ],
        },
        {
          heading: "为什么我的字体在 PDF 里看起来不对?",
          paragraphs: [
            "几乎一定是字体替换。PowerPoint 用你本机安装的字体来解析这份幻灯片;而我们服务器上的 LibreOffice Impress 只能用容器镜像里自带的字体来解析。如果幻灯片用了服务器没装的字体(企业授权字体、Creative Cloud 里的 Adobe Fonts、或者像 Calibri Light 这类微软独占字体),LibreOffice 会拿最接近的字体来替换——而替换的度量值几乎不可能完全匹配。",
            "修复方法在源文件里:打开 PowerPoint,进入 文件 → 选项 → 保存 → 「在文件中嵌入字体」,并勾选「仅嵌入演示文稿中使用的字符(适合减小文件大小)」。这样字体就会随 .pptx 本体一起被打包,LibreOffice Impress 在转换时直接用它们,最终 PDF 会按你预期的字体渲染。这是性价比最高的保真度优化,而且零成本。",
          ],
        },
        {
          heading: "转换刚好卡在 5 秒超时,怎么办?",
          paragraphs: [
            "对 5 MB 以下且内容常规的幻灯片,5 秒预算完全够用。会触发超时的工作簿大都有以下三种特征之一:几十张高分辨率内嵌图片需要 LibreOffice 逐页栅格化、嵌入视频流让 LibreOffice 试图抽取封面帧、或者上百张幻灯片带有深层母版-版式继承。",
            "上传前请通过 PowerPoint 的 图片格式 → 压缩图片 把图片压到 150 ppi(打印质量)或 96 ppi(屏幕质量)。把嵌入视频替换成一张静态封面图加一个指向托管视频地址的超链接。如果幻灯片确实很长(100 页以上),请按章节断点拆分成几份分别转换,再用我们的 PDF 合并与拆分工具一次性拼回去。",
          ],
        },
        {
          heading: "被限速了(429),脚本场景里怎么避免?",
          paragraphs: [
            "每分钟 5 次的上限刻意定得偏紧,目的是保证全体用户的响应延迟可预测,而不是为了卡死企业用户。两条干净路径都有效:在脚本里诚实地遵守 `Retry-After` 头并做退避;或者使用 Docker Compose 自托管整套栈——仓库是 MIT 协议,限速本身只是一个环境变量 `RATE_LIMIT_MAX_REQUESTS`。",
            "自托管同时也意味着你可以用 Gotenberg 的 `--libreoffice-disable-routes` 和 `--api-port` 参数,把转换服务收进你自己的 VPC,并配合你企业内部的 SSO 网关使用。",
          ],
        },
        {
          heading: "我的 .ppt(2007 之前的二进制格式)被 415 拒绝",
          paragraphs: [
            "我们的网关校验 OOXML 的魔术字节 `50 4B 03 04`。真正的旧版 .ppt 使用更早的 OLE2 compound document 格式,魔术是 `D0 CF 11 E0`,我们也接受。但实际上有相当一部分被命名为 .ppt 的文件其实是导出的 HTML 或者栅格化图片序列,这些会在魔术字节阶段就被拒。",
            "如果你拿到的是真正的旧版二进制并且确实有原因失败——被密码保护、含已废弃宏模块、或母版幻灯片损坏——请在新版 PowerPoint 里打开、解除保护、另存为 .pptx。2007 之后的 OOXML 容器有更好的压缩与统一 schema,我们的管线对它的保真度也比对 OLE2 高得多。",
          ],
        },
        {
          heading: "上传前的最佳实践 checklist",
          paragraphs: [
            "下面五个步骤,加起来花不到一分钟,但能消除大约九成的保真度问题,而且没有任何副作用。",
          ],
        },
      ],
      bullets: [
        "在 .pptx 中嵌入字体(文件 → 选项 → 保存 → 在文件中嵌入字体)——这是性价比最高的保真度优化。",
        "上传前通过 图片格式 → 压缩图片 把图片压到 150 ppi——未压缩的照片几乎一定主导文件体积。",
        "把嵌入视频替换为「封面图 + 超链接」——LibreOffice 抽取视频帧需要的真实时间相当可观。",
        "接受动画和切换效果会被剥离这一事实——PDF 无法表达它们,所以请直接渲染你真正希望被看到的最终状态。",
        "上传前用「另存为 → PowerPoint 演示文稿 (.pptx)」再保存一次,刷新出干净的 OOXML 信封。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
