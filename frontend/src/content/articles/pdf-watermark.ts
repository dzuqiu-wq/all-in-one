import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CANVAS-LAYER WATERMARKING",
  title: "Why electronic stamps and tile watermarks belong in your browser, not on a server",
  lead:
    "An e-stamp is not just a graphic — it is a public-facing claim about authenticity. Generating one in your browser, applying it to a PDF without uploading, and shipping the result back to your downloads folder is one of the cleanest demonstrations of how far client-side processing has come. This page is the engineering breakdown of how the All-in-One Toolbox watermarking surface does it.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Watermarks and stamps live at the intersection of branding, evidence, and visual hierarchy. They are everywhere — invoices, contracts, draft documents, controlled-distribution PDFs — but the standards governing them are scattered across jurisdictions and surprisingly nuanced.",
      subsections: [
        {
          heading: "Visual marks versus cryptographic signatures",
          paragraphs: [
            "A watermark or graphical stamp does not, by itself, prove anything. It signals — to a casual reader — that a document is associated with a specific organisation, status, or owner. Cryptographic signatures (PAdES under EU eIDAS, RSA-PSS x.509 in U.S. Federal Bridge PKI, Digital Signature Standards under PKCS#7) are what actually bind a document to an identity in a way that can be verified by a third party. The two systems are complementary: a stamp tells the reader 'someone branded this'; a cryptographic signature lets the reader prove it.",
            "Our tool intentionally focuses on the visual layer. It does not pretend to be a substitute for a cryptographic signature, and we do not silently inject anything into the PDF metadata that could be misread by a downstream signature verifier. If you need eIDAS-compliant qualified signatures, use a dedicated trust service. If you need a clean visual e-stamp on a draft invoice, this tool is built precisely for that.",
          ],
        },
        {
          heading: "Where watermarks are required (or expected)",
          paragraphs: [
            "Three families of regulation tell you, sometimes implicitly, that a watermark is required. The first is internal classification: an enormous body of corporate policy mandates that draft contracts, financial statements before close, and patent filings under embargo be visibly marked DRAFT, CONFIDENTIAL, or EYES-ONLY. Failure to mark such documents is the most common cause of accidental over-disclosure in M&A workflows.",
            "The second is regulatory tagging. CFR Title 21 (FDA), HIPAA-aligned medical records, and GDPR-derived data classification policies all expect human-readable tags on printable documents. A red \"INVALID — DRAFT\" diagonal is more recoverable from a printed copy than any metadata field that a printer will silently discard.",
            "The third is brand and provenance. E-stamps shaped like circular Chinese 公章, oval 业务章, or rectangular Western corporate seals carry centuries of cultural weight. In jurisdictions where the stamp itself carries legal weight (much of East Asia, parts of Latin America), the visual mark is not decorative — it is the deal.",
          ],
        },
        {
          heading: "Why pure-frontend matters for sensitive watermarking",
          paragraphs: [
            "Consider the irony of uploading a confidential draft to a server in order to add the word \"CONFIDENTIAL\" to it. The act of upload negates the classification. Yet most online watermark tools require exactly that round-trip — and many retain the result for indexing, ad personalisation, or 'product improvement'.",
            "Our tool runs inside your browser tab. The document is loaded into a Uint8Array, processed by pdf-lib's content stream API, and written back out to a Blob URL. The bytes never traverse the network. Anyone who needs to prove that fact to their compliance team can open the browser DevTools Network panel and verify the zero requests during processing.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Stamping a PDF in JavaScript requires three primitives: an offscreen canvas to rasterise the stamp into pixels, pdf-lib to inject those pixels into each page's content stream, and a careful approach to coordinate transforms because PDF and the browser disagree about which direction the Y axis points.",
      subsections: [
        {
          heading: "Stamp rendering on an OffscreenCanvas",
          paragraphs: [
            "The seal you see in the preview is generated entirely on the client side using `OffscreenCanvas`. For a circular Chinese-style 公章, the renderer draws three layers: an outer ring (with deliberate, parameterised gap noise to mimic an ink-on-paper look), a five-pointed star inset, and arcing text around the upper hemisphere. For oval and rectangular seals the geometry is parameterised differently but the layering convention is identical.",
            "Noise is the secret ingredient. A perfectly smooth digital seal looks fake. We sample a deterministic pseudo-random noise function (seeded from the company name) and apply micro-rotations, micro-translations, and per-pixel alpha drops to the ring stroke. The result is a stamp that, at typical document resolution, looks pleasingly hand-applied.",
          ],
        },
        {
          heading: "Coordinate systems: the PDF Y axis is flipped",
          paragraphs: [
            "In a browser canvas, (0, 0) is the top-left corner and Y grows downward. In PDF, (0, 0) is the bottom-left corner and Y grows upward. This is a recurring source of bugs in client-side watermark tools — early prototypes of ours had stamps appearing in the wrong corner of each page until we standardised on a single transform helper.",
            "The fix is to compute stamp coordinates in PDF space once, then keep them there. We use pdf-lib's `page.drawImage(...)` and `page.drawText(...)` APIs in raw PDF coordinates rather than translating in and out of Canvas coordinates per page.",
          ],
        },
        {
          heading: "Tile watermarking with opacity and rotation",
          paragraphs: [
            "Tile watermarks (the repeating diagonal \"DRAFT\" pattern) are implemented by walking a grid of (x, y) anchor points across each page and drawing the watermark text at each anchor, rotated by the configured angle. The horizontal and vertical spacing are user-controllable and the renderer guarantees a 24 px gutter from the page edge so the text never bleeds off the side.",
            "Opacity is applied through pdf-lib's `opacity` parameter, which translates to a PDF graphics state object (gs dictionary) carrying an `/CA` alpha-constant entry. This is the canonical PDF mechanism for transparent overlays, ensuring that downstream readers — from Chrome to Acrobat to mobile previewers — interpret the watermark consistently.",
          ],
        },
        {
          heading: "Hybrid mode: stamp + text in one pass",
          paragraphs: [
            "Hybrid mode renders both an electronic seal and a tile watermark in a single content-stream injection per page. The performance cost is essentially zero — the PDF content stream is appended once with two graphics operators rather than mutated twice — but the user perception is that of a one-click finished document.",
            "Pages are processed in parallel batches of four when the input has more than ten pages, using `Promise.all` over a microtask queue. On a modern laptop, a 100-page PDF watermarks in well under a second.",
          ],
        },
        {
          heading: "Memory hygiene: re-using the stamp canvas",
          paragraphs: [
            "The stamp graphic is generated once per session, cached as a PNG-encoded Uint8Array, and reused across every page. Without this optimisation, a 100-page watermark would invoke the noise renderer 100 times. With it, the canvas allocation is amortised and per-page latency drops by an order of magnitude.",
            "On document close, the Uint8Array is dereferenced and reclaimed automatically. No long-lived global state is retained.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Watermarking tends to fail in obvious ways when it fails at all: the stamp appears in the wrong place, the text is too transparent to read, or the destination PDF triggers a font-substitution warning in Acrobat. Below are the most-reported variants and their fixes.",
      subsections: [
        {
          heading: "My stamp shows boxes instead of Chinese company name characters",
          paragraphs: [
            "By default we use a CJK-capable font for the company-name arc. If you are seeing boxes (tofu) it almost always means the page's other fonts have collided with the stamp font in a way the reader does not know how to resolve. The fix is to switch the stamp font from the dropdown to one that you confirmed renders in your target reader, or to provide a Latinised company-name fallback for non-CJK distribution.",
            "A subtler variant: some PDF readers on Linux distros without `fonts-noto-cjk` installed will fall back to bitmap glyphs that look like boxes. The watermark itself is correct — the reader is the problem. Opening the same PDF in Chrome will usually show the watermark correctly.",
          ],
        },
        {
          heading: "The watermark is too faint to see when printed",
          paragraphs: [
            "Screens are forgiving; cheap office printers are not. A watermark at 20% opacity looks fine in Acrobat but can disappear entirely when printed on a busy black-and-white laser printer. If the printed output must be legible, raise the watermark opacity to 35-40% and switch from a pure black to a high-contrast hue (we recommend the coral preset for this exact reason).",
            "Conversely, if your watermark is too dark on screen, your viewer may be applying a dark-mode inversion. Open the PDF in a non-inverting viewer such as Acrobat Reader to confirm what the document actually contains.",
          ],
        },
        {
          heading: "I added a tile watermark and the file size doubled",
          paragraphs: [
            "A heavy tile watermark adds drawing operators to every page, but should not double file size unless the stamp PNG is being embedded once per page rather than once per document. Our tool embeds the stamp PNG as a single XObject referenced from each page, so the marginal cost of an additional page is the size of the page-level reference, not the size of the stamp.",
            "If you observe an unexpectedly large output, it is usually because the source PDF contained uncompressed content streams that the pdf-lib re-write expanded. Pass the result through any PDF compressor (we recommend Ghostscript with `-dPDFSETTINGS=/printer`) to bring it back into line.",
          ],
        },
        {
          heading: "I want to remove a watermark applied with this tool",
          paragraphs: [
            "We do not provide an unwatermarking feature, by design. The closest legitimate workflow is to keep your unwatermarked source file privately and apply watermarks only on the distributable copy. If you have lost the source, professional PDF editors can erase a watermark layer manually — but the result will visibly degrade the document underneath where the watermark was, especially for text close to the watermark stroke.",
          ],
        },
        {
          heading: "Best-practice tips",
          paragraphs: [
            "These conventions will keep watermark workflows predictable across legal, finance, and design teams:",
          ],
        },
      ],
      bullets: [
        "Use red-coral for DRAFT marks; reserve deep ink for CONFIDENTIAL and CONTRACT.",
        "Choose rotation 30°-45° for diagonal tiles — straight horizontal can be misread as document content.",
        "Apply electronic seals at 20-25% opacity to preserve underlying text readability.",
        "Keep your unwatermarked master PDF in private storage; do not re-create from watermarked copies.",
        "When sending the same document to multiple recipients, vary the watermark text per recipient — it makes leak attribution straightforward.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 客户端 Canvas 水印层",
  title: "电子印章与平铺水印为什么属于浏览器，而不是服务器",
  lead:
    "电子印章不只是一张图——它是一份对外公开的「真实性主张」。在浏览器内生成它、不上传地把它盖到 PDF 上、再把结果送回你的下载目录，是「客户端处理」这件事最干净的一次演示。本页是 All-in-One Toolbox 水印与印章工具的全部工程拆解。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "水印与印章处于品牌、证据与视觉层级的交叉点。它们出现在发票、合同、草稿文档、限定分发的 PDF 里——但围绕它们的标准散落在不同司法管辖区里，比一般人想象的细腻得多。",
      subsections: [
        {
          heading: "视觉标识 vs 密码学签名",
          paragraphs: [
            "水印或图形印章本身证明不了任何事。它给读者一个信号——「这份文档与某个组织、某种状态、某位所有者有关联」。真正能把文档与某个身份绑定并被第三方验证的，是密码学签名（欧盟 eIDAS 下的 PAdES、美国联邦桥接 PKI 里的 RSA-PSS X.509、PKCS#7 数字签名标准）。两套系统互补：印章告诉读者「有人在上面留了标记」，密码签名让读者能证明这个标记。",
            "我们工具刻意只做视觉层。它不会假装自己是密码签名的替代品，也不会偷偷往 PDF 元数据里塞任何可能误导下游签名校验器的内容。如果你需要 eIDAS 合规的合格签名，请使用专业的可信任服务。如果你只是要给一份草稿发票盖一个干净的电子章——这把工具就是为你准备的。",
          ],
        },
        {
          heading: "在哪些场景里水印是「必须」（或被默认期望）的",
          paragraphs: [
            "有三类法规——有时是隐式地——告诉你水印是必须的。第一是内部分级：大量企业政策要求草稿合同、未关账的财务报表、处于禁运期的专利申请，必须显式地标注 DRAFT、CONFIDENTIAL 或 EYES-ONLY。在并购流程里，未标注是「意外过度披露」最常见的原因。",
            "第二是合规标签：FDA 的 CFR Title 21、HIPAA 对齐的医疗记录、GDPR 派生的数据分级政策，都要求人类可读的标签出现在可打印文档上。一条斜跨页面的红色「INVALID — DRAFT」在打印件上比任何元数据字段都更可恢复——元数据会被打印机静默丢弃。",
            "第三是品牌与出处。圆形公章、椭圆业务章、欧美的方形公司印——它们携带的是数百年的文化分量。在某些把印章本身视为具有法律效力的司法管辖区（东亚多数地区、部分拉美），印章不是装饰——它就是合同本身。",
          ],
        },
        {
          heading: "为什么「敏感水印」必须用纯前端",
          paragraphs: [
            "想象一下这个讽刺场景：你把一份机密草稿上传到服务器，只为了在上面加「机密」两个字——上传这个动作本身已经把这份机密给泄漏了。但市面上大多数在线水印工具恰恰就要求这个往返过程，并且其中不少会留一份用于索引、广告画像或「产品改进」。",
            "我们的工具完全运行在你这个浏览器标签页里。文档被读到一个 Uint8Array，pdf-lib 的 content stream API 处理它，最后写回一个 Blob URL。字节从未离开你的设备。需要向合规团队证明这点的人，可以打开浏览器 DevTools 的 Network 面板，亲眼看到处理过程中网络请求为零。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "用 JavaScript 给 PDF 盖章，至少需要三件武器：一块 OffscreenCanvas 把印章光栅化成像素、pdf-lib 把这些像素塞到每一页的 content stream 里、以及对 PDF 与浏览器 Y 轴方向相反这件事保持高度警惕。",
      subsections: [
        {
          heading: "在 OffscreenCanvas 上离屏渲染印章",
          paragraphs: [
            "你在预览里看到的印章完全由前端用 `OffscreenCanvas` 生成。圆形公章会分三层：外圈（带可参数化的间隙噪点，模拟印泥落在纸上的感觉）、五角星嵌入、上半圆弧形排布的公司名称文字。椭圆和方形印章的几何参数不同，但分层惯例完全一致。",
            "噪点是关键。完全光滑的数字印章一眼就「假」。我们采样一份种子由公司名生成的伪随机噪声函数，对外圈描边施加微旋转、微平移、逐像素 Alpha 衰减。结果就是一个在常规文档分辨率下看起来「就像手盖上去」的印章。",
          ],
        },
        {
          heading: "坐标系：PDF 的 Y 轴是反的",
          paragraphs: [
            "浏览器 canvas 里 (0, 0) 在左上角、Y 轴朝下增长。PDF 里 (0, 0) 在左下角、Y 轴朝上增长。这是客户端水印工具反复踩坑的地方——我们早期原型就出现过印章跑到错误页角的情况，直到我们统一了一个坐标转换 helper。",
            "我们最终决定一次性把印章坐标算成 PDF 空间坐标，之后全程不再转换。我们使用 pdf-lib 的 `page.drawImage(...)` 与 `page.drawText(...)` API，直接在 PDF 坐标系里工作，不再来回穿越 Canvas 坐标。",
          ],
        },
        {
          heading: "平铺水印：透明度与旋转角",
          paragraphs: [
            "平铺水印（每页那种重复的斜向「DRAFT」图案）通过在每页上遍历一个 (x, y) 锚点网格，并在每个锚点上以指定角度绘制水印文字来实现。横向与纵向间距都允许用户调整，渲染器会强制保留页面边缘 24 px 的安全边距，确保文字不会被切掉。",
            "透明度通过 pdf-lib 的 `opacity` 参数实现，它会落实为 PDF 图形状态对象（gs dict）里的 `/CA` 透明度常量。这是 PDF 用于半透明叠加的标准机制，能保证下游各种阅读器——Chrome、Acrobat、移动端预览——都解读一致。",
          ],
        },
        {
          heading: "混合模式：印章 + 文字一次到位",
          paragraphs: [
            "混合模式在一次 content stream 注入里同时盖印章和平铺文字水印。性能开销几乎为零——content stream 只追加一次，两个图形指令并列写入——但用户感知是「一键即得完工文档」。",
            "当输入超过 10 页时，我们使用 `Promise.all` 在微任务队列上以每批 4 页并行处理。现代笔记本上，一份 100 页的 PDF 加水印通常在 1 秒以内完成。",
          ],
        },
        {
          heading: "内存卫生：复用印章 canvas",
          paragraphs: [
            "印章图形每个会话只生成一次，缓存为 PNG 编码的 Uint8Array，被所有页复用。如果没有这个优化，100 页文档要让噪点渲染跑 100 次。有了它之后，canvas 分配被均摊，单页延迟下降一个数量级。",
            "文档关闭时，Uint8Array 被解引用并自动回收。我们不保留任何长生命周期的全局状态。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "水印失败时往往失败得很明显：印章出现在错误位置、水印文字透明到看不见、或者目标 PDF 在 Acrobat 里触发了字体替换告警。下面是最常被反馈的几种变体与对应解法。",
      subsections: [
        {
          heading: "公章上的公司名变成「豆腐方块」？",
          paragraphs: [
            "我们默认给印章弧形公司名使用一套支持 CJK 的字体。如果你看到方块（tofu），通常意味着源页面的其它字体与印章字体在阅读器里发生了冲突。修复办法是从下拉菜单里把印章字体换成你确认能在目标阅读器里正常渲染的，或者为非 CJK 分发场景提供一个拉丁化的公司名回落。",
            "还有一种更隐蔽的情况：某些 Linux 发行版没装 `fonts-noto-cjk`，PDF 阅读器会回落到看起来像方块的位图字体。其实水印本身是对的——阅读器才是问题。同一份 PDF 用 Chrome 打开，通常就显示正常。",
          ],
        },
        {
          heading: "打印时水印淡到几乎看不见",
          paragraphs: [
            "屏幕显示对透明度很宽容；办公廉价打印机就没有那么宽容。20% 透明度的水印在 Acrobat 里看着没问题，但打到一台繁忙的黑白激光打印机上可能完全消失。如果打印件必须可读，把水印透明度提到 35-40% 并从纯黑切到高对比的色相（我们推荐珊瑚色预设，正是出于这个原因）。",
            "反过来，如果水印在屏幕上太深，可能是阅读器开启了深色模式反色。换一个不反色的阅读器（比如 Acrobat Reader）确认实际文档内容到底是什么。",
          ],
        },
        {
          heading: "加平铺水印后文件大小翻倍了",
          paragraphs: [
            "高密度平铺水印的确会在每页增加绘制指令，但不应让文件大小翻倍——除非印章 PNG 被错误地「每页都嵌一份」而不是「整文档共享一份」。我们的工具把印章 PNG 嵌成一个全局 XObject，每页只引用它。增加一页的边际成本是「页级引用」的大小，而不是「印章本体」的大小。",
            "如果你确实观察到了不正常的体积增大，通常是因为源 PDF 里有未压缩的 content stream，被 pdf-lib 重写时展开了。把结果交给任意一款 PDF 压缩器（我们推荐 Ghostscript 带 `-dPDFSETTINGS=/printer`）即可回到正常水平。",
          ],
        },
        {
          heading: "我想撤掉之前加上的水印",
          paragraphs: [
            "我们故意不提供「撤水印」功能。最干净的工作流是：把没加水印的源文件私下保留，只给可分发副本加水印。如果源文件已经丢了，专业 PDF 编辑器可以手工擦除水印图层，但被擦除处下方的文档会出现明显的退化痕迹，特别是紧贴水印笔画的文字。",
          ],
        },
        {
          heading: "实用小技巧",
          paragraphs: [
            "下面这些约定能让水印工作流在法务、财务和设计团队之间更可预测：",
          ],
        },
      ],
      bullets: [
        "DRAFT 标记用珊瑚红；CONFIDENTIAL 和 CONTRACT 留给深墨色。",
        "斜向平铺的旋转角度选 30°-45° —— 完全水平很容易被误读为文档内容本身。",
        "电子印章使用 20-25% 透明度以保留底层文字可读性。",
        "未加水印的「母版 PDF」请单独存档，不要从已加水印的副本反推。",
        "把同一份文档发给多位收件人时，让每份的水印文字略有不同——一旦泄漏，归因会非常直接。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
