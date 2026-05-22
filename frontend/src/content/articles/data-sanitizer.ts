import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · ENCODING DETECTION & CSV REPAIR",
  title: "Why the same CSV opens fine in one editor and as gibberish in another",
  lead:
    "Encoding-related garble is the most universal pain point in cross-system data exchange. A CSV produced by a Chinese ERP and opened in a U.S.-locale Excel renders as 锟斤拷; the same Excel-on-Mac sometimes saves spreadsheets as UTF-8 with BOM while Excel-on-Windows defaults to the platform's ANSI code page. Untangling the resulting mess is what the Data Sanitizer was built for, and the algorithms behind it are an excellent advertisement for the under-appreciated discipline of character encoding.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Encoding compatibility is not a Unicode versus legacy story — it is a story about specific code pages, the platforms that emit them, and the deceptively-named auto-detect heuristics that have to bridge them. Knowing the landscape is half the battle.",
      subsections: [
        {
          heading: "UTF-8 versus the legacy code pages",
          paragraphs: [
            "Unicode (and its dominant transport encoding UTF-8) was meant to be the universal answer. For most new software it is. But the data exchanged today still carries decades of legacy: Windows-1252 from old Western European Office installs, GBK and GB18030 from Chinese-mainland systems, Big5 from Taiwan and Hong Kong, Shift-JIS from Japanese systems, EUC-KR from Korean systems, KOI8-R from older Russian Unix shops, ISO-8859 family across most pre-2010 European exports.",
            "Each of those code pages assigns different bytes to the same Unicode codepoint. The byte sequence `0xC4 0xE3` is a valid two-byte 'GBK' character meaning 你 (Chinese 'you'). The same two bytes interpreted as Windows-1252 spell 'Äã'. Without metadata that distinguishes them, the interpretation depends entirely on whatever the reader's default code page happens to be.",
          ],
        },
        {
          heading: "The Byte Order Mark and what it does (and does not) do",
          paragraphs: [
            "UTF-8 specifies an optional Byte Order Mark — the three bytes `0xEF 0xBB 0xBF` at the start of the file — which Excel and several other tools use as a signal that the file is UTF-8 rather than the system default. Files without a BOM are guessed at, with platform-specific defaults that differ between Excel-Windows and Excel-Mac.",
            "Our sanitizer's first-pass detector specifically checks for and respects the BOM. It also surfaces the BOM presence so you can choose whether to keep it on export (Excel-Windows usually prefers it; most modern data tools do not).",
          ],
        },
        {
          heading: "Where this matters: cross-border accounting, ERP imports, scientific datasets",
          paragraphs: [
            "Three workflows dominate the demand. First, accounting imports: a Chinese subsidiary exports a transactions CSV from its local ERP (GBK-encoded), and the parent company's U.S. accountant opens it in Excel, sees garble, and asks IT to fix it. Second, scientific dataset distribution: a Russian astronomy collaboration shares observation logs in Windows-1251, a Brazilian collaborator opens them in UTF-8 Excel and sees the same garble symmetrically.",
            "Third, government open data: many municipal open-data portals still publish CSVs in legacy code pages because their underlying databases pre-date Unicode normalisation. Researchers building dashboards from those feeds need a sanitizer that detects the encoding without prior knowledge.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Detecting an unknown encoding is fundamentally a probabilistic exercise. The sanitizer applies multi-layer detection (BOM, statistical n-gram analysis, language-specific heuristics) and gives the user the ability to override the detection if they know better. Every step runs inside the browser.",
      subsections: [
        {
          heading: "Stage 1 — BOM detection",
          paragraphs: [
            "The first bytes of the file are inspected. `EF BB BF` indicates UTF-8 with BOM. `FF FE` and `FE FF` indicate UTF-16 LE and BE respectively. `FF FE 00 00` indicates UTF-32 LE. If any of these patterns is present, detection is over and the file is decoded with the appropriate codec.",
            "The vast majority of legacy code-page files lack a BOM, so the next stages run for them.",
          ],
        },
        {
          heading: "Stage 2 — n-gram statistical detection",
          paragraphs: [
            "Each candidate code page (UTF-8, GBK, Big5, Shift-JIS, EUC-KR, Windows-1252, ISO-8859-1, KOI8-R) has a known statistical fingerprint of the most common byte-pair (bigram) frequencies in real-world documents. We collect the empirical bigram distribution from the file's first 16 KB, compute a chi-squared distance to each candidate fingerprint, and select the candidate with the lowest distance.",
            "This is the same algorithm Mozilla's old `chardet` library used. It is remarkably effective at separating the major CJK code pages from each other and from European code pages, and it is fast enough to run on multi-megabyte files in milliseconds. The fingerprints themselves are precomputed and shipped in the JavaScript bundle.",
          ],
        },
        {
          heading: "Stage 3 — language-aware tie-breaking",
          paragraphs: [
            "When chi-squared distance gives two candidates within a small confidence margin, language heuristics break the tie. For example, GBK and Big5 are difficult to distinguish on short text because they share many bigrams. The disambiguator looks for distinctive Big5 characters (which use the upper region of the byte space differently from GBK) and shifts the decision accordingly.",
            "If even the tie-breakers cannot achieve confidence above 70%, the sanitizer surfaces both candidates in the UI and lets the user pick. The 'Re-decode' button on the page is exactly this: a per-decision override that lets the human be the final arbiter.",
          ],
        },
        {
          heading: "Stage 4 — CSV structural parsing via PapaParse",
          paragraphs: [
            "Once decoded text is in hand, the CSV needs to be parsed structurally. We use PapaParse, a Web Worker-capable CSV library that handles edge cases other parsers butcher: quoted strings containing commas, escaped quotes, mixed line endings, and BOM-prefixed first columns.",
            "PapaParse runs in a worker for files over 200 KB so the main thread stays responsive even on multi-megabyte inputs. The parser's row-by-row callback feeds a virtualised preview table — meaning a 100,000-row CSV can be inspected in the browser without paying the DOM cost of rendering every row.",
          ],
        },
        {
          heading: "Stage 5 — Excel via SheetJS",
          paragraphs: [
            "Excel files (.xlsx, .xls) are not CSVs and do not have encoding issues per se — they bundle their own internal text representations. But they are subject to a different family of bugs, most commonly column-type coercion (a column of postcodes mistakenly inferred as numeric and stripped of leading zeros).",
            "SheetJS (the `xlsx` package) handles both legacy .xls binary and modern .xlsx (zipped XML). It exposes the sheet structure as a JavaScript object that we can render in the same virtualised table as the CSV path, with the column-type inference made visible so users can override it.",
          ],
        },
        {
          heading: "Export pipeline: re-encode to whatever the user needs",
          paragraphs: [
            "The corrected data can be exported in four formats: UTF-8 CSV (the safe default), .xlsx (for Excel-Windows users with strict needs), JSON (for data engineering pipelines), and Markdown table (for documentation drops). All four exports run client-side; we never see the data.",
            "JSON exports preserve the column type inference from the SheetJS or PapaParse parser so downstream tools can ingest the data without re-inferring. Markdown exports include alignment hints derived from column types (numeric → right-aligned, text → left-aligned).",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Most sanitizer issues fall into one of three categories: misdetection of the source encoding, structural ambiguity that no parser can resolve, and Excel-flavoured surprises (date columns, leading-zero numbers, locale-dependent decimal separators). The recipes below cover each.",
      subsections: [
        {
          heading: "The auto-detect picked GBK but the file is actually Big5",
          paragraphs: [
            "Short files (under 4 KB) sometimes lack enough statistical signal to disambiguate GBK from Big5 confidently. The auto-detector returns its best guess plus a confidence score; when the score is under 70%, both candidates are surfaced in the encoding dropdown.",
            "Click the 'Re-decode' button and pick Big5 manually. The decoded preview will update immediately. If you suspect a less common Asian code page (Shift-JIS for Japanese, EUC-KR for Korean), pick it from the dropdown — the entire decode → parse pipeline re-runs with the new codec in under 200 ms.",
          ],
        },
        {
          heading: "Some rows have more columns than the header",
          paragraphs: [
            "Misaligned column counts almost always come from unescaped delimiters inside a field value: a customer name that contains a comma, an address that contains a newline. PapaParse handles quoted fields correctly, but if the source CSV did not quote them, the parser cannot recover.",
            "If the source you got is unquoted and contains in-field delimiters, the only correct fix is at the source: re-export with proper RFC 4180 quoting. If that is not possible, manually edit the misaligned rows in a text editor before processing — but be aware that any pattern-based fix is a heuristic at best.",
          ],
        },
        {
          heading: "Excel ate my leading zeros (postal codes, IDs)",
          paragraphs: [
            "Excel infers column types when importing CSVs. A column whose first row reads '00123' will be inferred as numeric and stored as the number 123, losing the leading zeros. This is technically not a sanitizer problem — it happens after import — but our preview shows column type inference and lets you mark a column as 'Text' before export.",
            "When you export as .xlsx with a column marked as text, the resulting file forces Excel to treat the values as strings regardless of their content. Excel-on-Windows respects the type metadata; Excel-on-Mac sometimes does not, and Numbers (Apple's spreadsheet) often does not. Test against the recipient's actual software when leading-zero preservation matters.",
          ],
        },
        {
          heading: "Decimal separators (1,234.56 vs 1.234,56)",
          paragraphs: [
            "European locale spreadsheets use the comma as the decimal separator and the period (or space) as the thousands separator. American and Chinese locales reverse this. A CSV produced in Germany and opened in the U.S. will misinterpret '1,234' as one thousand two hundred thirty-four rather than the decimal 1.234.",
            "The sanitizer detects the prevalent separator style and warns when the choice looks ambiguous. The exported file uses period-as-decimal by default; for European recipients, switch to .xlsx export which carries explicit locale metadata.",
          ],
        },
        {
          heading: "Best-practice tips",
          paragraphs: [
            "These conventions keep CSV / Excel workflows manageable across locales:",
          ],
        },
      ],
      bullets: [
        "When you control the producer, always emit UTF-8 with BOM — Excel reads it correctly on all platforms.",
        "Use RFC 4180 quoting around any field that could contain delimiters or newlines.",
        "Mark known-text columns (postcodes, IDs) explicitly before exporting to .xlsx.",
        "Use ISO 8601 (YYYY-MM-DD) for dates in CSV; locale-specific date strings are the second most common source of garble after encoding itself.",
        "When in doubt about the source encoding, save a sample and ask the producer — there is no shame in not auto-detecting a 200-byte text file.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 编码检测与 CSV 修复",
  title: "为什么同一份 CSV 在不同编辑器里一个正常一个乱码",
  lead:
    "编码乱码是跨系统数据交换里最普遍的痛点。中国 ERP 导出的 CSV 在美区 Excel 中变成 锟斤拷；同一份 Mac Excel 有时保存为带 BOM 的 UTF-8，Windows Excel 默认却是平台 ANSI 代码页。理清这些乱象，正是数据清洗器存在的理由——它背后的算法是「字符编码」这门低估学科的优秀广告。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "编码兼容性并不是「Unicode vs 旧代码页」这么简单的故事——而是关于具体哪些代码页、哪些平台还在产出它们、以及那些名字甜美其实坑很多的自动检测启发式。理解这块全景，问题就解决了一半。",
      subsections: [
        {
          heading: "UTF-8 与遗留代码页家族",
          paragraphs: [
            "Unicode（及其主流传输编码 UTF-8）被设计为「通用答案」。多数新软件确实做到了。但今天仍在流通的数据里仍背着几十年的遗留：来自旧版西欧 Office 的 Windows-1252、来自中国大陆的 GBK 与 GB18030、来自港台的 Big5、来自日本的 Shift-JIS、来自韩国的 EUC-KR、来自旧俄系 Unix 的 KOI8-R、覆盖 2010 年前几乎所有欧洲导出的 ISO-8859 家族。",
            "上述代码页给「同一个 Unicode 码点」分配的是不同字节。比如字节序列 `0xC4 0xE3` 在 GBK 里是合法两字节字符「你」；同样两字节按 Windows-1252 解读则是 `Äã`。在没有元数据指明编码的情况下，解读结果完全取决于阅读器的默认代码页。",
          ],
        },
        {
          heading: "BOM 字节序标记：它能做什么，不能做什么",
          paragraphs: [
            "UTF-8 规范允许在文件开头放一个可选的字节序标记（BOM）：`0xEF 0xBB 0xBF`。Excel 与若干工具把它当作「这文件是 UTF-8 而非系统默认」的信号。没有 BOM 的文件就只能被「猜」——而 Windows Excel 与 Mac Excel 的默认猜法并不一样。",
            "我们清洗器的第一轮检测器会先识别并尊重 BOM，并在 UI 中显式展示「是否带 BOM」，由你在导出时决定保留与否（Windows Excel 通常希望保留；多数现代数据工具不要）。",
          ],
        },
        {
          heading: "为什么这件事在跨境会计、ERP 导入、科研数据集里至关重要",
          paragraphs: [
            "三类工作流主导需求。第一是会计导入：中国子公司从本地 ERP 导出交易 CSV（GBK 编码），母公司美国会计师在 Excel 里打开看到乱码，去找 IT。第二是科研数据集分发：俄罗斯天文协作组以 Windows-1251 共享观测日志，巴西合作者在 UTF-8 Excel 里打开，看到对称的另一种乱码。",
            "第三是政府开放数据：很多市政开放数据平台仍然以遗留代码页发布 CSV，因为它们底层数据库早于 Unicode 普及。基于这些数据建仪表盘的研究者需要一款「不需要先验信息」的清洗器自动判别编码。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "检测未知编码本质上是概率问题。清洗器做多层检测（BOM、统计性 n-gram 分析、语言特异性启发式），并允许用户在更了解情况时手动覆盖。每一阶段都跑在浏览器内。",
      subsections: [
        {
          heading: "阶段 1 · BOM 探测",
          paragraphs: [
            "先看文件开头几个字节：`EF BB BF` 是带 BOM 的 UTF-8；`FF FE` 与 `FE FF` 分别是 UTF-16 LE 与 BE；`FF FE 00 00` 是 UTF-32 LE。命中任意一种，检测结束，直接用对应 codec 解码。",
            "绝大多数遗留代码页文件都没有 BOM，所以下面几个阶段是为它们准备的。",
          ],
        },
        {
          heading: "阶段 2 · n-gram 统计检测",
          paragraphs: [
            "每种候选代码页（UTF-8、GBK、Big5、Shift-JIS、EUC-KR、Windows-1252、ISO-8859-1、KOI8-R）在真实文档里都有一份已知的「最常见字节对（bigram）频率」指纹。我们从文件前 16 KB 中统计实际 bigram 分布，对每个候选指纹计算卡方距离，选距离最小者。",
            "这是 Mozilla 早年 `chardet` 用的算法。它在分辨主要 CJK 代码页彼此、以及与欧洲代码页之间表现极佳，并且在几 MB 文件上几毫秒就能跑完。指纹本身是预计算并打进 JS bundle 的。",
          ],
        },
        {
          heading: "阶段 3 · 语言特异性破平",
          paragraphs: [
            "当卡方距离给出两个候选差距极小时，由语言启发式破平。比如 GBK 与 Big5 在短文本上常常难以分辨——它们共享大量 bigram。破平器会在两者使用字节空间上半区的方式上寻找差别，从而调整决策。",
            "如果破平后置信度仍低于 70%，清洗器会把两个候选都摆在 UI 里让用户选择。页面上的「重新解码」按钮正是这个意思：每次决策都可以手动覆盖，最终裁决权交给人。",
          ],
        },
        {
          heading: "阶段 4 · 通过 PapaParse 完成 CSV 结构解析",
          paragraphs: [
            "拿到解码文本后，CSV 仍需结构化解析。我们用 PapaParse——一款支持 Web Worker 的 CSV 库——处理其它解析器常翻车的边缘情况：引号内嵌逗号、转义引号、混合行尾、首列带 BOM。",
            "文件大于 200 KB 时 PapaParse 跑在 worker 内，让主线程在多 MB 输入下仍保持响应。它逐行回调的能力被我们用于驱动一张虚拟化预览表——也就是说 10 万行 CSV 也能在浏览器里检视，而不需要把每一行都渲染到 DOM。",
          ],
        },
        {
          heading: "阶段 5 · 通过 SheetJS 处理 Excel",
          paragraphs: [
            "Excel 文件（.xlsx、.xls）不属于「CSV 编码问题」——它们内部自带文本表示。但有另一族常见 bug，最典型是列类型推断错误（一列邮编被错误推断为数字并被剥掉前导零）。",
            "SheetJS（`xlsx` 包）同时支持遗留 .xls 二进制和现代 .xlsx（zip 包装的 XML）。它把工作表暴露为 JavaScript 对象，我们用同一张虚拟化表渲染，并将列类型推断显式化让用户可以覆盖。",
          ],
        },
        {
          heading: "导出管线：按用户需求重新编码",
          paragraphs: [
            "修复后的数据可以导出为四种格式：UTF-8 CSV（安全默认）、.xlsx（满足 Windows Excel 严格需求）、JSON（数据工程管线）、Markdown 表格（文档落点）。四种导出全部跑在客户端，我们看不到数据。",
            "JSON 导出会保留 SheetJS / PapaParse 推断出的列类型，让下游工具直接使用而无需再次推断。Markdown 导出会基于列类型生成对齐提示（数值右对齐、文本左对齐）。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "清洗器问题大多落在三类：源编码误判、解析器无法解决的结构歧义、以及 Excel 自带的「惊喜」（日期列、前导零数字、locale 相关的小数点分隔）。下面是覆盖率最高的几类与对应解法。",
      subsections: [
        {
          heading: "自动识别成 GBK 但实际是 Big5",
          paragraphs: [
            "短文件（小于 4 KB）有时统计信号不足以稳健分辨 GBK 与 Big5。自动检测会同时返回最佳猜测与置信度；当置信度低于 70%，两个候选都会出现在「编码」下拉里。",
            "点「重新解码」手动选 Big5，预览即时更新。如果你怀疑是更冷门的亚洲代码页（日语 Shift-JIS、韩语 EUC-KR），从下拉直接选——整条「解码 → 解析」管线会以新 codec 在 200 ms 内重跑。",
          ],
        },
        {
          heading: "有些行的列数比表头还多",
          paragraphs: [
            "列对不齐几乎都是因为字段值里有未转义的分隔符：客户名字里有逗号、地址里有换行。PapaParse 能正确处理带引号字段；但如果源 CSV 一开始就没加引号，解析器就无能为力。",
            "拿到的源是「未引号 + 含分隔符」时，唯一正确的修复在源头：让对方按 RFC 4180 重新导出。如果办不到，就在文本编辑器里手工修复错位行——但要明白任何基于模式的修复都只是启发式。",
          ],
        },
        {
          heading: "Excel 把我的前导零吃掉了（邮编、ID）",
          paragraphs: [
            "Excel 导入 CSV 时会推断列类型。一列第一行是 `00123` 会被推断为数字 123，前导零丢失。严格地说这不是清洗器问题——发生在导入之后——但我们的预览展示了列类型推断，并允许你在导出前把某列显式标为「文本」。",
            "把列标记为文本后导出为 .xlsx，结果文件会强制 Excel 把这些值当字符串处理。Windows Excel 尊重该类型元数据；Mac Excel 有时不尊重；Apple Numbers 通常不尊重。如果保留前导零关键，请用接收方真实使用的软件做一次往返测试。",
          ],
        },
        {
          heading: "小数点分隔符（1,234.56 vs 1.234,56）",
          paragraphs: [
            "欧洲本地化表格用逗号作小数点、句点（或空格）作千分位。美国与中国 locale 相反。德国导出的 CSV 在美国打开，`1,234` 会被理解为一千二百三十四，而不是 1.234。",
            "清洗器会探测主流分隔符样式，并在歧义时给出警告。导出文件默认用句点作小数点；面向欧洲接收方时，请用 .xlsx 导出——它会携带显式 locale 元数据。",
          ],
        },
        {
          heading: "实用小技巧",
          paragraphs: [
            "下面这些约定能让 CSV / Excel 工作流跨 locale 时保持可控：",
          ],
        },
      ],
      bullets: [
        "你能控制生产方时，始终输出带 BOM 的 UTF-8——所有平台的 Excel 都能正确读到。",
        "对可能含分隔符或换行的字段，按 RFC 4180 加引号。",
        "导出为 .xlsx 前显式标记已知文本列（邮编、ID）。",
        "日期字段统一用 ISO 8601（YYYY-MM-DD）——本地化日期字符串是仅次于编码本身的第二大乱码来源。",
        "对源编码不确定时，留一份样本去问生产方——为一份 200 字节的小文本「自动检测失败」不是失败，而是合理。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
