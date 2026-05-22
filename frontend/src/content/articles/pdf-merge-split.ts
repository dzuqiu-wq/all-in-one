import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CLIENT-SIDE PDF OBJECT GRAPH",
  title: "Merging and splitting PDFs without ever leaving your tab",
  lead:
    "Most online PDF merge tools demand an upload, run a server-side process, and then quietly retain a copy of your file for 'analytics'. Ours never sees a byte. The entire merge and split pipeline runs inside the same JavaScript bundle that paints the page, using pdf-lib's in-memory object graph and the browser's File API.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "PDF is a 1993-era specification that grew into ISO 32000 and now anchors essentially every kind of binding paperwork — contracts, statements, prescriptions, certificates, judicial filings. Working with PDFs at scale means respecting both the structural conventions of the format and the regulatory framework that has wrapped around it.",
      subsections: [
        {
          heading: "ISO 32000 and the object graph that defines a PDF",
          paragraphs: [
            "Internally, a PDF is a graph of numbered objects connected by references — much like a tiny in-file database. Each page is an object that references content streams (the actual drawing instructions), font resources, image XObjects, and a hierarchy of structural elements. Merging two PDFs is therefore not a matter of concatenating bytes; it is a matter of carefully copying source objects into a new document while preserving cross-reference integrity.",
            "ISO 32000-1 (PDF 1.7) and ISO 32000-2 (PDF 2.0) describe how the cross-reference table (the 'xref' table at the file's tail) maps each object ID to a byte offset. Naive concatenation breaks the xref table immediately and produces files that any conforming reader will reject. A correct merger has to copy objects, allocate fresh IDs in the target document, fix up indirect references, and re-emit a single coherent xref.",
          ],
        },
        {
          heading: "Where merge and split fit in the document lifecycle",
          paragraphs: [
            "Three concrete workflows account for the majority of demand. First, contract assembly: a lawyer or operations lead receives an executed signature page from one party, an annex from another, and a master agreement from a third — they need to be combined into a single document with consistent page numbering. Second, regulatory bundling: medical, tax, or customs filings often require a single PDF that contains photos of receipts, scans of forms, and printouts of confirmations. Third, page extraction for redaction: an attorney sends only pages 1-3, 5, and 7-10 of a sensitive document to opposing counsel, and the rest stays sealed.",
            "Each of these use cases used to require either Adobe Acrobat Pro (commercial, $20-30/month) or one of dozens of free-with-tracking sites. We believe the technology is mature enough that this can be a five-second drag-and-drop operation that never touches a server.",
          ],
        },
        {
          heading: "Why client-side processing matters for legal-grade PDFs",
          paragraphs: [
            "PDFs intended for legal use frequently carry signatures, encryption, and embedded timestamps. Even seemingly innocuous metadata — the author field, the producer string, the creation date — is sometimes asserted as evidence in disputes. A merge tool that strips or rewrites that metadata silently has just modified evidence. Our tool preserves source metadata in each retained page, only adds a fresh 'Producer: pdf-lib (All-in-One Toolbox)' line at the document level, and never re-issues object identifiers within copied pages.",
            "The privacy story is even simpler: a PDF that never left your laptop cannot be subpoenaed from us, indexed by us, or accidentally leaked through us. There is nothing to leak. This is the strongest possible architectural guarantee — stronger than any 'we promise not to peek' commitment.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "pdf-lib is a pure-JavaScript implementation of the PDF specification. It runs in your browser, has no WebAssembly dependency, and ships in roughly 50 KB gzipped. That is small enough to bundle directly into the page, which is how we manage to start processing the instant the dropzone fires its first event.",
      subsections: [
        {
          heading: "Loading and parsing the source PDFs",
          paragraphs: [
            "When you drop a PDF onto the dropzone, the browser materialises it as a File object — a thin wrapper around the underlying Blob. We call `file.arrayBuffer()` to obtain the raw bytes synchronously into memory and hand them to `PDFDocument.load(bytes, { ignoreEncryption: false })`. pdf-lib parses the xref table at the file's tail, walks the cross-reference, and builds an in-memory object graph that mirrors the structure of the source PDF.",
            "Encrypted PDFs are explicitly rejected at this stage rather than silently bypassed. Most encryption you see in the wild is owner-password-only (which permits reading but not modification); a small fraction is user-password-protected. We refuse both rather than offering brittle bypass paths — if a document is encrypted, removing the encryption is the user's decision and not ours.",
          ],
        },
        {
          heading: "Copy semantics: copyPages, not concat",
          paragraphs: [
            "The single most important pdf-lib API for the merge operation is `targetDoc.copyPages(sourceDoc, indices)`. This method walks the page-tree object hierarchy of the source PDF, deep-copies each referenced resource into the target document's resource pool, and returns a fresh array of `PDFPage` objects whose internal references already point into the target's object table.",
            "Crucially, copyPages handles indirect-reference rewiring automatically. A page may reference a font resource, which references a CIDFont descriptor, which references a font program stream. Copying just the page without recursively copying the resource subtree would produce an invalid PDF whose 'F1' reference dangles. pdf-lib does the full DAG walk.",
          ],
        },
        {
          heading: "Range parsing for the split operation",
          paragraphs: [
            "The split UI accepts expressions such as `1-3, 5, 7-10`. Internally this is parsed by a deterministic finite-state recogniser: split on commas, then for each token, test whether it matches `^[0-9]+$` (single page) or `^[0-9]+-[0-9]+$` (range). Out-of-range values, inverted ranges (`5-3`), and duplicate page indices are flagged with friendly inline errors rather than silently corrected.",
            "After parsing, the resulting index array is passed to `copyPages` in user-supplied order, which means you can reorder a document by typing `3, 1, 2` rather than dragging tiles around. Power users discover this within ten seconds of opening the tool.",
          ],
        },
        {
          heading: "Why this scales to fifty-megabyte PDFs in the browser",
          paragraphs: [
            "PDFs are stream-heavy: most of their byte budget is consumed by content streams (vector graphics) and image XObjects. pdf-lib does not decode those streams unless we explicitly ask it to — for a merge or split, the binary blobs are simply re-emitted into the output document without re-encoding. The expensive parsing is limited to the object graph, which is generally a few percent of total file size.",
            "Memory consumption stays bounded by the largest single source document, not by the sum of the inputs. This is what lets you merge a dozen 4 MB PDFs in under a second on a five-year-old laptop without the browser tab hitting its heap ceiling.",
          ],
        },
        {
          heading: "Web Worker offload for very large documents",
          paragraphs: [
            "When we detect inputs above 20 MB, we hand the merge/split work to a Web Worker so the main thread stays responsive — progress bars update smoothly, dialogs remain interactive, and the user can still scroll the page while a 200-page document is being reassembled. The Worker imports the same pdf-lib module via `importScripts`, processes the buffers off-thread, and posts the resulting bytes back to the page for download.",
            "The Worker boundary is also our security boundary: if a malformed PDF crashes the parser, the Worker terminates and the main thread surfaces a friendly error rather than freezing the tab. Recovery is automatic.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Failure modes for in-browser PDF processing are different from server-side. The most common issues stem from encrypted PDFs, browser memory ceilings on aged devices, and unusual font subsetting in PDFs produced by exotic exporters. The recipes below cover the dominant cases.",
      subsections: [
        {
          heading: "\"This PDF appears to be password protected\" — what now?",
          paragraphs: [
            "We reject password-protected PDFs deliberately. Even when only the 'owner password' is set (the common case where you can read but not edit the file), bypassing that restriction is contractually murky — the owner of the document signalled intent that it not be modified. Our tool refuses to interpret that as a request to remove the lock.",
            "If you legitimately own the document and need to remove the password, the cleanest path is to open it in any PDF reader that supports printing (Chrome, Firefox, Preview on macOS, Adobe Reader) and 'print to PDF'. The reprint will be a fresh file without the password, with the trade-off that any form fields and annotations will be flattened into the page content.",
          ],
        },
        {
          heading: "The browser hung when I tried to merge thirty large files",
          paragraphs: [
            "Each browser tab gets a few gigabytes of JavaScript heap on a desktop machine, but only a few hundred megabytes on mobile. Merging thirty 50 MB PDFs simultaneously can push past those ceilings, particularly on iOS where Safari is more conservative.",
            "The workaround is incremental merge: merge files one through ten, save the result, then merge the result with files eleven through twenty, and so on. The final file is identical to the all-at-once merge. We're considering adding a streaming mode that does this automatically; for now, the manual workflow is reliable.",
          ],
        },
        {
          heading: "The merged PDF lost a font and now reads in a generic serif",
          paragraphs: [
            "Some PDF authoring tools (notably older Word for Mac exports and certain Linux PDF printers) emit PDFs that reference fonts without embedding them — the assumption being that the reader has the same fonts installed locally. When pdf-lib copies such a page into a new document, the font reference is preserved but readers that lack the named font fall back to a generic substitute.",
            "The fix is upstream of our tool: re-export the original document with 'Embed all fonts' enabled. In Word, that lives under File → Options → Save. In LibreOffice it is on the PDF Export dialog. In Chrome's print-to-PDF, font embedding is on by default and you don't need to do anything.",
          ],
        },
        {
          heading: "Pages came out rotated 90 degrees after merging",
          paragraphs: [
            "Each PDF page carries its own /Rotate property — sometimes set to 90, 180, or 270 degrees relative to the page's actual content. Different readers interpret /Rotate differently: Chrome respects it, Adobe Acrobat respects it, some mobile previewers ignore it.",
            "If your merged file looks correct in Chrome but rotated in Acrobat (or vice versa), the source pages probably have inconsistent /Rotate metadata. The fix is to normalise them: open each source in a desktop PDF editor, rotate manually, save, then re-merge. Our tool intentionally does not modify /Rotate on copied pages because that would be a destructive edit that the user did not request.",
          ],
        },
        {
          heading: "Best-practice tips",
          paragraphs: [
            "Five small habits make merge and split workflows much smoother:",
          ],
        },
      ],
      bullets: [
        "Name your source files in the order you want them — Chrome's dropzone preserves filename ordering, which beats dragging after the fact.",
        "When extracting pages, write the range out instead of clicking thumbnails — typed input is faster and more reproducible.",
        "If a source PDF is over 50 MB, run it through our Image Optimizer first on its image-heavy pages by exporting and re-importing — the result is often 50% smaller with no visible loss.",
        "Avoid 'Save As' loops in Adobe Acrobat between merges; they re-write the xref table each time and can quietly inflate file size by ~10%.",
        "If you need exact page numbers in the final document, set page numbering in the source headers/footers before merge rather than relying on a post-merge renumber.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 客户端 PDF 对象图",
  title: "不离开浏览器标签页就能完成的 PDF 合并与拆分",
  lead:
    "网上多数 PDF 合并工具都需要你「上传」一份文件，让它在服务端跑一遍，然后悄悄留一份「用于数据分析」。我们这里一个字节都不会离开你的设备。整条合并与拆分流水线就跑在画出这个页面的同一个 JavaScript bundle 里，使用 pdf-lib 的内存对象图 + 浏览器 File API。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "PDF 是一份 1993 年起步、后来长成 ISO 32000 的格式，今天几乎所有具备约束力的文档——合同、对账单、处方、证书、司法文书——都以它为最终交付容器。规模化处理 PDF，就必须既尊重它的结构传统，又尊重在它周围已经成形的法规框架。",
      subsections: [
        {
          heading: "ISO 32000 与定义 PDF 的对象图",
          paragraphs: [
            "PDF 的内部本质是一张「带编号对象 + 引用边」的图，结构上很像文件内嵌的小型数据库。每一页是一个对象，它引用了若干 content stream（实际绘图指令）、字体资源、图像 XObject，以及一棵描述结构的元素树。合并两份 PDF 因此从来不是「把字节拼起来」这么简单——它是把源对象拷贝到一个新文档里，同时严格保持交叉引用完整性的过程。",
            "ISO 32000-1（PDF 1.7）和 ISO 32000-2（PDF 2.0）规范了 xref 交叉引用表（写在文件末尾）如何把每个对象 ID 映射到字节偏移。简单的二进制拼接会立刻摧毁 xref 表，产出任何合规阅读器都会拒绝的文件。一个正确的合并器必须做到：复制对象、在目标文档里分配新的 ID、修正所有间接引用、并最终重新生成一份连贯的 xref。",
          ],
        },
        {
          heading: "合并与拆分在文档生命周期里的位置",
          paragraphs: [
            "我们生产环境上看到的需求集中在三类工作流。第一是合同装订：律师或运营负责人收到一方寄来的签字页、另一方的附件、第三方提供的主合同，要把它们合并成一份页码连贯的最终文档。第二是合规报送：医疗、税务、海关申报，常常要求一份 PDF 既包含发票照片、又包含表单扫描、还包含确认页打印件。第三是抽页脱敏：律师只把第 1-3、5、7-10 页发给对方律师，其他页面保持封存。",
            "在过去，这些工作要么需要 Adobe Acrobat Pro（商业软件，月费 20-30 美元），要么用十几个「免费但顺便跟踪你」的网页工具。我们认为这项技术已经足够成熟，可以变成一次拖拽就完成的 5 秒操作，并且全程不碰服务器。",
          ],
        },
        {
          heading: "为什么「客户端处理」对法律级 PDF 特别重要",
          paragraphs: [
            "面向法律用途的 PDF 经常带有签名、加密和嵌入时间戳。即使是看似无关紧要的元数据——作者字段、生成器字符串、创建日期——有时候也会在争议里被援引为证据。一个会偷偷重写元数据的合并工具，等于在动证据。我们的工具会保留被保留页的源元数据，仅在文档级别新增一条 `Producer: pdf-lib (All-in-One Toolbox)`，对被拷贝页面内部的对象标识符不重新分配。",
            "隐私层面的论证更简单：一份从未离开过你的电脑的 PDF，无法被我们传唤、无法被我们索引、也无法被我们误泄漏，因为根本没有「我们这边的副本」可以泄漏。这是工程上能给出的最强承诺——比任何「我们保证不偷看」的合同条款都更强。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "pdf-lib 是一个用纯 JavaScript 实现的 PDF 规范解析器，没有 WebAssembly 依赖，gzip 之后大约 50 KB。这种体积足够小到可以直接打进首屏 bundle 里——这就是为什么你刚把文件拖进 dropzone，我们就已经开始处理。",
      subsections: [
        {
          heading: "加载与解析源 PDF",
          paragraphs: [
            "当你把 PDF 拖到 dropzone 时，浏览器把它实例化为一个 File 对象——本质是底层 Blob 的薄包装。我们用 `file.arrayBuffer()` 同步把原始字节读到内存，交给 `PDFDocument.load(bytes, { ignoreEncryption: false })`。pdf-lib 会扫描文件末尾的 xref 表、遍历交叉引用、构建一张与源 PDF 结构同构的内存对象图。",
            "这一阶段我们会显式拒绝加密 PDF，而不是悄悄绕过。市面上多数加密只设置了「Owner Password」（允许阅读但不允许修改）；少数同时启用了「User Password」。两种我们都拒绝，因为绕过这两类锁本身是用户的决定，不是工具应当替用户做的事。",
          ],
        },
        {
          heading: "拷贝语义：copyPages 而不是 concat",
          paragraphs: [
            "整个合并操作中最关键的 pdf-lib API 就是 `targetDoc.copyPages(sourceDoc, indices)`。它会遍历源 PDF 的 page tree 对象树，递归把每一个引用到的资源深拷贝进目标文档的资源池，最后返回一组内部引用已经指向目标对象表的 `PDFPage` 实例。",
            "关键在于 `copyPages` 会自动处理「间接引用重写」。一页可能引用字体资源，该字体资源又引用 CIDFont 描述器，描述器又引用字体程序流。如果只复制页本身而不递归处理资源子树，结果就是一份 PDF 里所有 `F1` 引用都悬空。pdf-lib 会替你完成整张有向无环图的遍历。",
          ],
        },
        {
          heading: "拆分操作的范围语法解析",
          paragraphs: [
            "拆分 UI 接受类似 `1-3, 5, 7-10` 这样的范围表达式。我们用一个确定的有限状态识别器来解析：先按逗号切分，逐个 token 匹配 `^[0-9]+$`（单页）或 `^[0-9]+-[0-9]+$`（区间）。越界值、倒序区间（`5-3`）以及重复页码都会被行内友好提示，而不是默默纠正。",
            "解析完成后，索引数组会按你输入的顺序传给 `copyPages`，这就意味着你可以输入 `3, 1, 2` 来重排一份文档，而不需要鼠标拖块。重度用户通常在打开页面十秒内就能发现这个隐藏小技巧。",
          ],
        },
        {
          heading: "为什么这条管线能在浏览器里扛住 50 MB 大文档",
          paragraphs: [
            "PDF 是「以流为主」的格式：绝大部分字节体积花在 content stream（矢量绘图）和图像 XObject 上。pdf-lib 默认不会解码这些流，除非你显式要求——对于合并或拆分，这些二进制 blob 只是被原样写到目标文档里，不重新编码。真正解析的开销集中在对象图本身，通常只占总文件体积的几个百分点。",
            "内存占用由最大的单个源文档决定，而不是所有输入加起来。这就是为什么在五年前的笔记本上，你也可以在不到一秒内合并十多个 4 MB 的 PDF，而不会撞上 tab 的堆上限。",
          ],
        },
        {
          heading: "对超大文档启用 Web Worker 离线计算",
          paragraphs: [
            "当我们检测到输入文件超过 20 MB 时，会把合并 / 拆分的工作交给一个 Web Worker，让主线程保持响应：进度条平滑、对话框可交互、用户在 200 页文档重组时仍然可以滚动页面。Worker 内通过 `importScripts` 引入同一份 pdf-lib，在工作线程上跑完后，把结果字节 postMessage 回主线程供下载。",
            "Worker 边界同时是安全边界：如果一份畸形 PDF 让解析器崩溃，Worker 自身会退出，主线程会捕捉异常并显示一条友好的错误提示，而不是让整个 tab 卡死。恢复过程对用户完全透明。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "纯浏览器端 PDF 处理的失败模式和服务器端不一样。最常见的几类问题都来自：加密 PDF、老旧设备的浏览器堆上限、以及一些非主流 PDF 导出工具产生的字体子集化怪癖。下面是覆盖率最高的几条解决方案。",
      subsections: [
        {
          heading: "「这份 PDF 似乎受密码保护」——怎么办？",
          paragraphs: [
            "我们刻意拒绝处理任何带密码保护的 PDF。即使只设置了「Owner Password」（即可以阅读但不能编辑），绕过这把锁也是一件合同上很模糊的事——文件的所有者已经明示「不要修改」。我们的工具不愿意把这个信号解读为「请帮我移除限制」。",
            "如果你确认自己合法拥有这份文档并且需要去掉密码，最干净的方法是在任何支持「另存为 PDF」的阅读器里（Chrome、Firefox、macOS 预览、Adobe Reader）打开它，再「打印为 PDF」。重打印出来的就是一份没有密码的全新文件——代价是表单字段和注释会被压平到页面内容里。",
          ],
        },
        {
          heading: "合并三十个大文件时浏览器卡死了",
          paragraphs: [
            "桌面端每个浏览器标签页通常有几 GB 的 JS 堆上限，但移动端只有几百 MB，iOS 上的 Safari 尤其保守。同时合并 30 个 50 MB 的 PDF，确实有可能撞到这些上限。",
            "可行的做法是「分批合并」：先合并第 1 到第 10 份，保存结果，再用这个结果继续合并第 11 到第 20 份，以此类推。最终文件与「一次性合并」完全等价。我们正在考虑增加一个会自动这么干的「流式合并」模式，但当下手工分批是最稳的。",
          ],
        },
        {
          heading: "合并后某个字体丢了，变成默认衬线字体",
          paragraphs: [
            "一些 PDF 生成器（特别是较早版本的 Mac Word 导出和某些 Linux PDF 打印机）会输出「只引用、不嵌入」的字体——它们假设阅读端本地也装着同一字体。pdf-lib 把这种页复制到新文档里时，字体引用被保留，但缺少这个字体的阅读器会回落到默认替代字体。",
            "修复要在我们工具上游解决：用「嵌入所有字体」选项重新导出源文档。在 Word 中这个选项在 文件 → 选项 → 保存。LibreOffice 在 PDF 导出对话框里。Chrome 的「打印为 PDF」则默认就开启字体嵌入，你不需要做任何额外操作。",
          ],
        },
        {
          heading: "合并完之后某些页旋转了 90 度",
          paragraphs: [
            "每个 PDF 页面对象都有自己的 `/Rotate` 属性——有时候是相对于实际内容的 90、180 或 270 度。不同阅读器对 `/Rotate` 的解读不一致：Chrome 会遵循它、Adobe Acrobat 会遵循、部分移动端预览器会无视。",
            "如果你合并后的文件在 Chrome 中正常但在 Acrobat 中旋转了（或反之），通常是源页面带着不一致的 `/Rotate` 元数据。处理方式是「上游统一」：在桌面 PDF 编辑器里逐份打开、手动旋转、保存，再做合并。我们的工具刻意不动 `/Rotate`，因为这是一个用户没明确请求的破坏性编辑。",
          ],
        },
        {
          heading: "实用小技巧",
          paragraphs: [
            "下面五个小习惯能让合并和拆分的工作流顺很多：",
          ],
        },
      ],
      bullets: [
        "源文件按你想要的顺序命名好——Chrome 的 dropzone 会保留文件名顺序，比拖拽更可靠。",
        "抽页时直接输入范围，不要点缩略图——文字输入更快也更可复现。",
        "源文件超过 50 MB 时，先用我们的图片优化器把图像密集页面单独导出再导回——结果往往能小一半且视觉无损。",
        "尽量避免在 Adobe Acrobat 里反复「另存为」——每一次都会重写 xref 表，平均可能让文件膨胀 10%。",
        "如果你需要最终页码严格对齐，请在合并前就在源文档的页眉页脚里设置好分页编号，而不是合并后再补。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
