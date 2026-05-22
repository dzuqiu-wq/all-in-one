import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · ELECTRONIC INVOICING & PDF EXPORT",
  title: "Five global invoicing standards and one purely client-side generator",
  lead:
    "Electronic invoicing is no longer optional in most large economies. Italy, Mexico, Brazil, India, and increasingly the EU require structured e-invoices to flow between businesses and tax authorities. Smaller operators still need a clean PDF that renders the same on screen and on paper. This page covers both — the regulatory landscape and the JavaScript pipeline that produces invoices entirely inside your browser.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "The invoicing landscape is fragmented across jurisdictions. Some require XML over a government portal; some require PDF; some require both. Knowing what your jurisdiction expects matters as much as the technology you use to produce the file.",
      subsections: [
        {
          heading: "The major e-invoicing regimes",
          paragraphs: [
            "Italy's FatturaPA — mandatory since 2019 for B2B and B2G — requires XML invoices to flow through the Sistema di Interscambio (SDI). France's Chorus Pro extended that model to public-sector procurement and is rolling out B2B mandates through 2024-2026. Spain's TicketBAI in the Basque Country, Portugal's SAF-T (PT), Hungary's NAV, and Greece's myDATA all share a structural family resemblance: a government endpoint receives the XML, validates it, returns an acknowledgement code, and the seller may then issue the human-readable PDF.",
            "Latin America runs slightly ahead. Mexico's CFDI 4.0, Brazil's NFe (Nota Fiscal eletrônica), Chile's DTE, and Colombia's Documento Soporte all require government-issued unique identifiers that must be embedded in the invoice's PDF as a 2D code (often a QR or a Code 128 barcode). India's GSTN regime, mandatory for businesses above ₹5 crore annual turnover, follows a similar pattern with the IRN (Invoice Reference Number).",
            "Our generator does not communicate with any of these portals. It produces a clean, layout-faithful PDF whose data fields you can subsequently pipe into whichever XML schema your tax authority demands. For most small-and-medium businesses still operating in jurisdictions without an e-invoicing mandate, the PDF alone is the artefact of record.",
          ],
        },
        {
          heading: "What every invoice must contain",
          paragraphs: [
            "Across all jurisdictions, a small core of fields is universally required: the issuer's legal name and tax identifier, the recipient's legal name and tax identifier, an invoice number drawn from a sequential register, the issue date, the supply date, a line-by-line description of goods or services, unit prices, applicable taxes (VAT or GST), totals before and after tax, the currency, and payment terms.",
            "Our form ships with all these fields. The order is deliberately the order auditors expect: issuer block → recipient block → invoice metadata → line items → financial summary → payment instructions → notes. This matches the typographic order of physical invoices issued for centuries, which is also the order most accounting software exports.",
          ],
        },
        {
          heading: "Why client-side generation is appropriate for invoicing",
          paragraphs: [
            "Invoices contain personally identifiable information — names, addresses, sometimes national tax IDs — that is squarely inside scope for GDPR and analogous frameworks. Building an invoice on a server requires either explicit data-processing consent from the recipient or carefully scoped processing agreements. Building one inside your browser bypasses the entire question: the data never leaves your machine, no processor relationship is created, and the invoice PDF is produced as a side effect of a single button click.",
            "Some companies layer this with an automated bookkeeping system that ingests the produced PDF into accounting software offline — Xero, QuickBooks, Holvi, Lexware, Yokoy. Our generator's deterministic field layout makes that ingestion path reliable: column positions and currency formatting do not shift between invoices.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Generating a print-quality PDF in a browser tab requires two distinct passes: render an HTML/CSS preview that the user can refine, then snapshot that DOM into vector-faithful PDF output. We use a html2canvas + jsPDF pipeline orchestrated through React state.",
      subsections: [
        {
          heading: "Phase 1 — React form to live preview",
          paragraphs: [
            "The editor is a controlled React form. Every field — line item description, quantity, unit price, tax rate, discount — is bound to a single `useState` tree. As the user types, totals are recomputed reactively: subtotal is the sum of (qty × unit price) across line items, tax is subtotal × taxRate, total is subtotal + tax - discount. The preview pane re-renders on every keystroke, which gives the immediate WYSIWYG feel.",
            "Currency formatting is delegated to the browser's native `Intl.NumberFormat` API with the user-selected currency code. This guarantees that USD shows two decimals with a leading `$`, JPY shows zero decimals with a leading `¥`, and EUR shows the symbol position appropriate to the user's locale. No bespoke currency lookup is required.",
          ],
        },
        {
          heading: "Phase 2 — DOM snapshot via html2canvas",
          paragraphs: [
            "When the user clicks 'Generate PDF', html2canvas walks the live preview DOM and rasterises it to an OffscreenCanvas at 2× device pixel ratio (so the result looks crisp at 200% zoom in Acrobat and on Retina displays). The library handles CSS computed styles, including custom fonts loaded via `@font-face`, gradients, drop shadows, and border-radius — all of which would be lossy if we had relied on a print-CSS conversion alone.",
            "We deliberately render the preview in a hidden, fixed-width container while snapshotting so that ad blockers and responsive media queries cannot perturb the layout. The hidden container is 760px wide (US Letter at 96 dpi minus 20px margins) so the resulting canvas maps cleanly onto a printable PDF page.",
          ],
        },
        {
          heading: "Phase 3 — Canvas to PDF with jsPDF",
          paragraphs: [
            "The raw canvas pixels are then handed to jsPDF, which wraps them in a PDF wrapper using a single `addImage(...)` call. Because we know the page size up-front (US Letter or A4 depending on currency), the call site can also draw vector PDF text on top of the rasterised image for accessibility: screen readers can pick out the totals, and downstream OCR pipelines can read the structured fields.",
            "The output filename is built deterministically from the invoice number and issue date — `INV-2025-0042_2025-01-13.pdf` — so the resulting file sorts correctly when stored in a folder and avoids the dreaded `invoice (3) copy.pdf` filename clash that plagues bookkeeping software.",
          ],
        },
        {
          heading: "Why we do not use a PDF templating library",
          paragraphs: [
            "Libraries such as pdfmake or pdfkit offer declarative PDF construction in JavaScript. They produce smaller files and better-quality text. We evaluated them and chose against — pdfmake's declarative DSL forces the editing UI and the output renderer to share a structural language, which means every visual change has to be implemented twice. With html2canvas + jsPDF, the React preview *is* the output: WYSIWYG is real, not aspirational.",
            "The trade-off is that we ship a slightly larger generated file (a 200 KB raster page is normal). For invoicing, where archival and human review matter far more than absolute byte efficiency, this is the correct trade.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "The most common confusions in invoice generation are not bugs — they are mismatches between the user's intuition and the strict regulatory expectations of a tax authority. The fixes below cover both.",
      subsections: [
        {
          heading: "My invoice numbers are not sequential — why does that matter?",
          paragraphs: [
            "Most tax regimes require that invoice numbers be issued in an unbroken sequential register. Skipping numbers (intentionally or accidentally) is a yellow flag to auditors because it implies that an invoice was issued and then deleted. The legal exposure for missing invoices is far greater than the cosmetic exposure of a re-issued number.",
            "Our tool does not maintain a sequential register for you — it produces a single PDF on each click. Maintain your sequence in your accounting system or a simple spreadsheet, and use the format we pre-fill (`INV-2025-0042`) as a convention. If a draft invoice is created but never sent, treat the number as still consumed and explain the gap to your auditor with a short note.",
          ],
        },
        {
          heading: "Why is my total different from a manual calculation by one cent?",
          paragraphs: [
            "Floating-point rounding is the culprit. JavaScript represents `0.1 + 0.2` as `0.30000000000000004` because IEEE 754 doubles cannot encode decimal fractions exactly. We round to two decimal places at each line-item subtotal using banker's rounding (round half to even), which is what most tax authorities expect.",
            "If you observe a one-cent difference between our total and a manual addition, your manual addition is almost certainly summing un-rounded subtotals. Pull each line into a spreadsheet, round each, and the totals will match. If they still do not, the difference is in tax — VAT calculations introduce a second rounding step that is regulator-specific.",
          ],
        },
        {
          heading: "I need an invoice in two languages on the same page",
          paragraphs: [
            "Several international engagements require a bilingual invoice (e.g., English + Mandarin, English + Russian). Our generator does not produce multilingual side-by-side layouts natively. The workaround is to issue two single-language invoices with the same invoice number and a note in the body of each indicating that the other language version is the authoritative reference for that audience.",
            "Some auditors prefer this approach in any case: a single bilingual document is harder to validate against an XML schema than two language-pure documents that reference each other.",
          ],
        },
        {
          heading: "My logo looks blurry in the final PDF",
          paragraphs: [
            "html2canvas rasterises whatever pixel data the browser already holds for your logo. If the logo is a 200 × 60 PNG and your invoice header reserves a 400 × 120 area for it, the browser upscales the bitmap to fill the slot — and an upscaled PNG looks blurry.",
            "Replace the logo with an SVG version (vector) or with a PNG at least twice the display size (400 × 120 minimum for a header reserving 400 × 120). SVG is the cleanest answer because it scales without quality loss to any PDF resolution.",
          ],
        },
        {
          heading: "Best-practice checklist",
          paragraphs: [
            "These conventions make invoicing workflows audit-friendly:",
          ],
        },
      ],
      bullets: [
        "Use a sequential register: invoice numbers should never be reused or skipped.",
        "Date format ISO 8601 (YYYY-MM-DD) is unambiguous across jurisdictions; localised date strings should appear only in the rendered preview.",
        "Always include the issuer's tax identifier in the header even when the recipient is domestic — auditors look there first.",
        "Round each line subtotal to two decimals before summing; the regulator's calculator works that way.",
        "Archive the generated PDF alongside the source data — a CSV export of the form fields is enough for re-issue traceability.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 电子发票与 PDF 导出",
  title: "五大全球开票规范与一个纯前端发票生成器",
  lead:
    "对绝大多数主要经济体而言，电子开票已不再是「选项」。意大利、墨西哥、巴西、印度，以及越来越多的欧盟成员国都要求企业之间、企业与税务机关之间以结构化电子发票交换。小型经营者依然需要一份在屏幕和纸面上都呈现一致的干净 PDF。本页同时覆盖二者：监管全景，以及一条完全在浏览器内运行的发票生成流水线。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "全球开票合规高度碎片化。有些司法管辖区要求通过政府门户走 XML；有些只要 PDF；有些两者都要。理解你所在地区的具体要求，与你使用什么技术生成文件同样重要。",
      subsections: [
        {
          heading: "主流电子开票体系",
          paragraphs: [
            "意大利的 FatturaPA 自 2019 年起对 B2B 与 B2G 强制实施，要求所有 XML 发票必须通过 Sistema di Interscambio (SDI)。法国的 Chorus Pro 把这套模式扩展到公共采购，并正在 2024-2026 年逐步铺开 B2B 强制。巴斯克的 TicketBAI、葡萄牙的 SAF-T (PT)、匈牙利 NAV、希腊 myDATA，结构上同属一脉：政府端点接收 XML、校验、返回确认码，卖家随后可以签发人可读的 PDF。",
            "拉美走得更靠前。墨西哥 CFDI 4.0、巴西 NFe（Nota Fiscal eletrônica）、智利 DTE、哥伦比亚 Documento Soporte 全都要求把政府签发的唯一标识嵌进发票 PDF 的二维码或 Code 128 条码里。印度 GSTN 体系对年营业额超 5 千万卢比的企业强制要求 IRN（Invoice Reference Number），逻辑相同。",
            "我们的生成器不与上述任何门户通信。它产出的是一份排版忠实、字段干净的 PDF，你可以把其中的字段灌进你的税务机关所要求的任何 XML schema。对于多数仍处于「无强制电子开票」司法管辖区的中小企业，这份 PDF 本身就是入账凭证。",
          ],
        },
        {
          heading: "任何一份发票都必须包含的字段",
          paragraphs: [
            "几乎所有司法管辖区都共同要求一组核心字段：开票方法定名称与税号、收票方法定名称与税号、来自连续登记簿的发票号、开票日期、供应日期、按行展开的货物/服务描述、单价、适用税率（VAT 或 GST）、税前与税后总额、币种、付款条款。",
            "我们的表单原生覆盖这些字段，并且顺序刻意是审计员期望的顺序：开票方区块 → 收票方区块 → 发票元数据 → 行项目 → 财务汇总 → 付款指引 → 备注。这也是几个世纪以来纸质发票的版式顺序，恰好与多数会计软件的导出顺序一致。",
          ],
        },
        {
          heading: "为什么开票这件事适合「纯前端」",
          paragraphs: [
            "发票本身包含个人身份信息——姓名、地址、有时甚至是国家级税号——它毫无疑问落在 GDPR 等隐私框架的辖区里。如果发票要在服务器上生成，你要么需要从收票方获取明确的数据处理同意，要么需要订一份范围严格界定的数据处理协议。把这件事完全放到浏览器内做，整个问题就被绕过去了：数据从未离开你的电脑、不存在数据处理关系、发票 PDF 只是一次按钮点击的副产物。",
            "有些公司还会把它接到一套离线的记账自动化系统里——Xero、QuickBooks、Holvi、Lexware、Yokoy。我们生成器的版式确定性（列位置与货币格式逐次稳定）让这条 OCR / 模板抽取路径变得可靠。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "在浏览器内生成印刷级 PDF，要分两个独立阶段：先渲染一份用户可编辑的 HTML/CSS 实时预览，再把这个 DOM 快照成矢量保真的 PDF 输出。我们用 html2canvas + jsPDF 这条管线，由 React 状态统一编排。",
      subsections: [
        {
          heading: "阶段 1 · React 表单驱动实时预览",
          paragraphs: [
            "编辑器是一个完全受控的 React 表单。每一个字段——行项目描述、数量、单价、税率、折扣——都绑定到同一个 `useState` 树。用户输入时，总额是响应式重算的：小计 = Σ(数量 × 单价)；税额 = 小计 × 税率；总额 = 小计 + 税额 - 折扣。预览面板在每次按键时重新渲染，这就是它的「所见即所得」体验来源。",
            "货币格式化交给浏览器原生的 `Intl.NumberFormat`，按用户选择的币种码自动适配。USD 显示两位小数与前置 `$`、JPY 显示零位小数与前置 `¥`、EUR 的符号位置遵循用户 locale。我们不需要任何自制的货币查找表。",
          ],
        },
        {
          heading: "阶段 2 · 用 html2canvas 对 DOM 拍快照",
          paragraphs: [
            "用户点「生成 PDF」时，html2canvas 会遍历实时预览的 DOM，将其光栅化到一块 2× 设备像素比的 OffscreenCanvas（这样在 Acrobat 200% 放大和 Retina 显示器上都依然锐利）。这个库会处理 CSS 计算样式——包括通过 `@font-face` 加载的自定义字体、渐变、阴影、圆角——这些信息如果只靠 print CSS 转换会大量丢失。",
            "我们在快照阶段把预览刻意渲染到一个隐藏的、固定宽度的容器里，避免广告拦截扩展或响应式媒体查询扰动布局。隐藏容器宽 760px（US Letter @ 96 dpi 减去 20px 边距），保证生成的 canvas 可以干净地映射到可打印的 PDF 页面上。",
          ],
        },
        {
          heading: "阶段 3 · 用 jsPDF 把 Canvas 包装成 PDF",
          paragraphs: [
            "原始 canvas 像素接着交给 jsPDF，它用单次 `addImage(...)` 调用把像素塞进 PDF 容器里。因为页面尺寸是上游确定的（按币种选 US Letter 或 A4），jsPDF 还可以在光栅图像上方叠加矢量 PDF 文本以提升可访问性：屏幕阅读器能读出总额，下游 OCR 管线能识别结构化字段。",
            "输出文件名按发票号 + 开票日期确定性生成——`INV-2025-0042_2025-01-13.pdf`——这样存到一个文件夹里能正确排序，也不会出现「invoice (3) copy.pdf」这种困扰记账软件多年的命名冲突。",
          ],
        },
        {
          heading: "我们为什么不使用 PDF 模板库",
          paragraphs: [
            "pdfmake、pdfkit 这类库提供声明式 PDF 构造。它们的输出更小、文本质量更好。我们评估过并放弃——pdfmake 的声明式 DSL 强制编辑 UI 和输出渲染共用同一套结构语言，意味着每一次视觉改动都要在两个地方实现一次。换成 html2canvas + jsPDF 后，React 预览本身就是输出，「所见即所得」是真的，不是口号。",
            "代价是生成文件略大（一页 200 KB 光栅是常态）。但对开票这件事来说，归档价值与人类审查权重远高于字节效率，这是值得的取舍。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "开票场景里最常见的误会不是 bug，而是用户直觉与税务机关严格预期之间的错位。下面是覆盖率最高的几条问题与解法。",
      subsections: [
        {
          heading: "我的发票号不连续，会有问题吗？",
          paragraphs: [
            "几乎所有税务体系都要求发票号来自一份「不间断的连续登记簿」。跳号（无论是有意还是无意）在审计员眼里都是黄牌——它暗示「曾经开过一份然后被作废」。漏开的法律风险远高于「号码看起来不齐」这种表面问题。",
            "我们的工具不会替你维护这份登记簿——它每点一次只产出一份 PDF。请在你的会计系统或一张表格里维护编号序列，把我们预填的 `INV-2025-0042` 当作格式约定即可。如果某份草稿写完但没寄出，请把这个号视作已经消耗，并在补充说明里给审计员一行解释。",
          ],
        },
        {
          heading: "我的总额比手算差一分钱，怎么回事？",
          paragraphs: [
            "罪魁祸首是浮点数舍入。JavaScript 把 `0.1 + 0.2` 表示成 `0.30000000000000004`，因为 IEEE 754 双精度无法精确表达十进制小数。我们在每一条行小计处都用「银行家舍入」（half to even）四舍五入到两位小数，这是多数税务机关默认的舍入方式。",
            "如果你看到我们的总额与你手动加和差一分，几乎可以确定你的手动加法是在「未舍入的小计」上累加的。把每一行单独拉到表格里、各自舍入，再加，结果就一致了。如果仍然不一致，差距就在税额——VAT 计算里还有第二轮舍入步骤，规则因地而异。",
          ],
        },
        {
          heading: "我需要一份双语并排的发票",
          paragraphs: [
            "若干涉外业务确实要求双语发票（中英、英俄、英西等）。我们的生成器目前不直接产出双语并排版式。务实的做法是开两份单语发票，使用相同的发票号，在正文里加一行注释指明「另一种语言版本为对应受众的权威参考」。",
            "实际上也有相当一部分审计员更接受这种处理——两份语言单一、互相引用的文档，比一份双语并排的文档更容易对照 XML schema 校验。",
          ],
        },
        {
          heading: "我的 Logo 在 PDF 里发模糊",
          paragraphs: [
            "html2canvas 直接把浏览器已有的像素数据光栅化。如果你的 Logo 是 200 × 60 的 PNG，而发票头部为它预留了 400 × 120 的区域，浏览器会把位图放大去填满槽位——放大后的 PNG 自然模糊。",
            "请换成 SVG 矢量版，或者至少提供比展示尺寸大一倍的 PNG（头部 400 × 120 的话至少给 800 × 240）。SVG 是最干净的选项，它可以无损缩放到任何 PDF 分辨率。",
          ],
        },
        {
          heading: "最佳实践 checklist",
          paragraphs: [
            "下面这些约定能让开票工作流通过审计：",
          ],
        },
      ],
      bullets: [
        "使用连续登记簿：发票号不要重用，也不要跳号。",
        "日期统一用 ISO 8601（YYYY-MM-DD）；本地化日期字符串只出现在渲染预览里。",
        "即使收票方是国内企业，也始终在表头展示开票方税号——审计员最先看的位置。",
        "汇总前先在每行小计层面舍入到两位小数；监管机关的计算器就是这样工作。",
        "把生成的 PDF 与表单原始数据一起归档——一份 CSV 字段导出已经足够支撑重开追溯。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
