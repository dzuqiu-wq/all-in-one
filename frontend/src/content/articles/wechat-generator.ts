import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · WECHAT UI & DIGITAL ASSET VERIFICATION",
  title: "Pixel-Perfect Chat Mockups: Architecture, Security, and Forensic Detectability",
  lead:
    "WeChat mockup generators have become indispensable tools in design studios, editorial teams, and marketing agencies that need to produce realistic conversation screenshots without requiring access to live user accounts. These tools operate entirely in the browser, using canvas-based rasterisation pipelines and RFC 2397 data URIs to assemble pixel-accurate chat interfaces from component inputs. This whitepaper examines the rendering architecture, security boundaries, and forensic detectability considerations that product teams must understand before deploying such tools in enterprise workflows.",
  sections: [
    {
      id: "industry",
      heading: "Industry Context & Compliance Positioning",
      lead:
        "The proliferation of messaging platform interfaces in product design, editorial content, and marketing materials has created a specialised tooling category. Understanding where these tools fit in the design ecosystem and what compliance obligations they carry is the foundation for responsible deployment.",
      subsections: [
        {
          heading: "WeChat's Visual Language in Product Design",
          paragraphs: [
            "WeChat's interface vocabulary — the bubble layout, timestamps, read receipts, and multi-media attachment strips — has become so embedded in digital culture that it functions as a universal shorthand for 'digital conversation' regardless of the underlying platform. Product designers use WeChat-style mockups to prototype notification flows, communicate conversation state machines, and storyboard in-context messaging features without building full backend integrations.",
            "Design systems that incorporate WeChat-style components typically abstract the visual grammar into tokenised structures: bubble alignment (left for received, right for sent), avatar sizing (40px standard), timestamp precision (relative vs. absolute), and multi-media layout rules (aspect-ratio locked thumbnails). This tokenisation allows the same component library to generate outputs for multiple messaging platforms by swapping the visual theme layer.",
            "Enterprise design teams deploying WeChat mockup tools must ensure the tool's output format matches the target deliverable specification. For print editorial, a 2× device pixel ratio canvas export ensures crisp rendering at physical dimensions. For digital prototypes, SVG or high-resolution PNG at 3× provides the fidelity expected in high-fidelity design review sessions.",
          ],
        },
        {
          heading: "The Distinction Between Mockups and Authentic Screenshots",
          paragraphs: [
            "A critical legal and ethical boundary separates a tool that renders synthetic WeChat conversations from one that produces images indistinguishable from authentic user conversations. The former is a legitimate design asset; the latter can constitute impersonation, fraud, or false evidence in legal proceedings.",
            "Synthetic mockup images carry no veracity about real-world events or communications. They are explicitly design artefacts — created to communicate a design intent, illustrate a UX flow, or populate a template without exposing real user data. The moment a synthetic image is presented as an authentic communication, the tool's purpose shifts from design aid to potential instrument of deception.",
            "Industry best practices for mockup tools include watermarking the output to indicate its synthetic nature, embedding metadata that identifies the image as a mockup, and providing clear UI labelling that prevents accidental misuse. Platforms that distribute WeChat mockup images for public consumption should implement visible watermarks; enterprise internal tools may rely on metadata-only approaches depending on their threat model.",
          ],
        },
        {
          heading: "Ethical and Legal Boundaries",
          paragraphs: [
            "The legal landscape around synthetic messaging imagery varies significantly by jurisdiction. In China, where WeChat has billions of users, the creation and distribution of synthetic WeChat conversations that purport to be authentic can trigger provisions related to defamation, fraud, or interference with business relations under the Civil Code and the Criminal Law.",
            "For enterprise users, the safest deployment model treats WeChat mockup output as clearly labelled design material. Internal design reviews, stakeholder presentations, and developer handoff documentation are low-risk use cases because the audience knows the content is fabricated. High-risk use cases include any scenario where the mockup could be presented to third parties who might reasonably believe the content is authentic.",
            "A practical compliance framework for teams deploying mockup tools includes: mandatory watermark for any export intended for external sharing; explicit user agreement prohibiting use of the tool to create misleading content; audit logging of generation events for enterprise accounts; and periodic review of output content against fraud or impersonation indicators.",
            "International organisations operating across multiple jurisdictions should maintain a legal opinion on the permissibility of mockup use in each operating territory, particularly when the mockup tool is provided as a service to external clients who may apply the output in contexts the tool provider cannot foresee.",
          ],
        },
        {
          heading: "WeChat Mockup Tools in the B2B SaaS Landscape",
          paragraphs: [
            "The market for WeChat mockup tools has matured from simple screenshot compositors to integrated design-system platforms that maintain component libraries aligned with WeChat's UI evolution. Enterprise design teams evaluate these tools against criteria including: fidelity of bubble rendering across device form factors (mobile, tablet, desktop), support for the full range of WeChat message types (text, image, voice, video, red envelope, mini-program cards), and compatibility with design token standards such as the W3C Design Token format.",
            "B2B SaaS platforms that embed WeChat mockup functionality typically differentiate on workflow integration: direct export to Figma and Sketch via plugin APIs, version-controlled asset management with git-style diff for conversation states, and collaborative review with commenting and approval workflows that mirror the review processes used for authentic conversation archives.",
            "The pricing model for enterprise mockup tools typically follows a per-seat or per-workspace subscription, with usage-based billing for API access when mockup generation is embedded into automated content pipelines. Procurement teams should negotiate for audit rights that allow them to verify usage metrics are accurate, as the opacity of client-side generation makes it difficult to independently verify generation counts.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Client-Side Rendering Architecture",
      lead:
        "The rendering pipeline for WeChat mockup generation is entirely client-side, leveraging modern browser capabilities to produce high-fidelity raster output without any server-side processing. Understanding the technical architecture is essential for engineers evaluating these tools for enterprise deployment.",
      subsections: [
        {
          heading: "2× Device Pixel Ratio Canvas Rasterisation",
          paragraphs: [
            "The foundation of WeChat mockup rendering is a high-resolution canvas context configured for 2× device pixel ratio (DPR). On standard displays, 1 CSS pixel equals 1 physical pixel; on high-DPI displays (Retina, modern Android), 1 CSS pixel maps to 2 or more physical pixels. Rendering at 2× DPR ensures that the output image remains crisp when displayed on high-DPI screens or printed at physical dimensions.",
            "The canvas is initialised at the target output dimensions multiplied by the DPR multiplier. For a 1080px wide conversation export, the canvas element itself is 2160px wide, with a 2× scaling transform applied to the CSS dimensions. All drawing operations — bubble paths, text glyphs, avatar images — are executed at this higher resolution, producing an output raster that carries full spatial fidelity.",
            "Text rendering uses the Canvas 2D `measureText()` API to compute line breaks that match WeChat's native bubble width constraints. The implementation must handle multi-line text reflow, emoji sizing, and link detection without relying on any DOM-based layout engine, since the entire render occurs in an offscreen canvas with no layout tree.",
          ],
        },
        {
          heading: "RFC 2397 Base64 Data URI Pipeline",
          paragraphs: [
            "The avatar and image attachment pipeline uses RFC 2397 data URIs to embed binary assets directly into the canvas drawing commands. When a user supplies an avatar image, the tool reads the file as an ArrayBuffer, encodes it to base64, and constructs a data URI with the appropriate MIME type: `data:image/png;base64,iVBORw0KGgo...`.",
            "The data URI is then loaded into an in-memory `Image` object and drawn onto the canvas using `drawImage()`. This pipeline avoids creating object URLs that require explicit revocation and ensures that the final export blob contains no external resource dependencies — the entire image is self-contained.",
            "Base64 encoding increases the data size by approximately 33% relative to the original binary. For large image attachments embedded in mockup conversations, this overhead is acceptable given that the entire document is memory-resident during the export phase. Engineers should implement size warnings for attachments exceeding 2 MB to prevent memory pressure on constrained devices.",
          ],
        },
        {
          heading: "html2canvas Export and Blob URL Lifecycle",
          paragraphs: [
            "When the WeChat mockup includes HTML-formatted content — rich text, embedded links, styled timestamps — a hybrid rendering approach combines canvas rasterisation with selective DOM-to-canvas translation via html2canvas or similar libraries. The HTML components are first rendered in an offscreen DOM container, then rasterised to canvas at the configured DPR.",
            "The final composite canvas is converted to a Blob via `canvas.toBlob('image/png', 1.0)`. A Blob URL is created via `URL.createObjectURL(blob)` and immediately used for the download trigger. After the download is initiated, the Blob URL must be revoked via `URL.revokeObjectURL()` to prevent memory leaks in long-running sessions.",
            "The export pipeline handles both single-image exports (one conversation) and batch exports (multiple conversations bundled as a ZIP archive). Batch exports use the `Blob` constructor to assemble multiple canvas renders into a single archive, with each file named using a sanitised timestamp pattern: `wechat-mockup-{YYYYMMDD}-{HHMMSS}.png`.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Best Practices",
      lead:
        "WeChat mockup generators are robust tools, but certain configuration choices and environmental factors can degrade output quality or cause export failures. This section covers the most common failure modes and the corresponding remediation strategies.",
      subsections: [
        {
          heading: "Why Does My Avatar Look Blurry in Exports?",
          paragraphs: [
            "Blurry avatar output is almost always a DPR mismatch between the avatar source image and the canvas rendering context. If the source image is 80×80px and the canvas is rendering at 2× DPR, the avatar will be upscaled from 80px to 160px effective pixels — a 2× enlargement that reveals interpolation artefacts in photographic images.",
            "The solution is to supply avatar images at a minimum of 160×160px for 1× rendering, or 320×320px for 2× rendering. Design teams should prepare an avatar asset library at multiple resolution tiers: 40×40 (icon use), 80×80 (inline use), and 160×160 (mockup primary use). This tiered approach ensures the tool always selects an appropriately sized input.",
            "If the source image cannot be resized (e.g., a user-supplied photo), configure the canvas rendering to use `imageSmoothingEnabled = false` for pixel-art style avatars, or `imageSmoothingQuality = 'high'` for photographic avatars. The latter uses bicubic interpolation which produces perceptually smoother results for photographic content at moderate upscaling factors.",
          ],
        },
        {
          heading: "Detecting Mockups vs. Authentic Screenshots",
          paragraphs: [
            "Forensic analysis of WeChat mockups versus authentic screenshots involves examining metadata, compression artefacts, and structural consistency. Authentic screenshots carry device-specific metadata (Make, Model, Software version) in the EXIF header; synthetic exports from canvas-based tools carry no EXIF data or carry a default generator signature.",
            "The pixel-level forensic signals include: uniform font rendering (canvas text renders with consistent glyph weights, while native screenshots use device font rasterisation with subtle variations), consistent bubble geometry (mockup bubbles have uniform corner radii, while authentic screenshots reflect the rendering at the specific device's DPI), and absence of status bar elements (authentic screenshots include the device status bar with signal strength and time; mockups typically omit this).",
            "For organisations with high fraud risk, digital signing of mockup exports provides an auditable provenance chain. Embedding a HMAC signature in the image metadata allows downstream verification that the image was generated by an authorised tool and has not been tampered with after generation.",
          ],
        },
        {
          heading: "Performance Considerations for Large Chat Histories",
          paragraphs: [
            "Rendering a mockup conversation with hundreds of messages can strain browser memory, particularly on devices with limited RAM or when the messages include multiple large image attachments. Each image attachment loaded as a data URI consumes memory proportional to its decoded size, not its compressed file size.",
            "The recommended mitigation strategy is pagination: break large conversations into segments of 50 messages each, render each segment as a separate canvas, and compose the final export as a multi-page document or a tiled image grid. This approach keeps peak memory consumption bounded and provides a natural chunking for review workflows.",
            "For enterprise deployments handling high-volume mockup generation, consider implementing a Web Worker-based rendering pipeline that offloads canvas operations to a background thread. The main thread remains responsive for UI interactions while the worker performs the rasterisation, with `postMessage()` used to transfer the final Blob back to the main thread for export.",
          ],
        },
        {
          heading: "Export Format Selection: PNG vs SVG vs PDF",
          paragraphs: [
            "The choice of export format depends on the downstream use case. PNG is the default choice for web embedding, social media, and anywhere the image will be displayed at arbitrary sizes. PNG exports from canvas at 2× DPR produce files that remain crisp when scaled in image editors or displayed on high-DPI monitors.",
            "SVG export is preferred when the mockup needs to be edited in vector graphics software (Figma, Illustrator, Sketch) or when the output must remain scalable without quality degradation. However, SVG export from canvas-based mockup tools is technically complex because text rendered via canvas `fillText()` is rasterised into paths — the text is no longer editable as text in the vector editor.",
            "PDF export is appropriate when the mockup will be printed or included in a document that will be printed. PDF preserves the vector integrity of shapes while embedding the rasterised text as embedded fonts or vector paths. For high-volume automated report generation that includes WeChat conversation mockups, a headless browser service (Puppeteer or Playwright) can render HTML templates to PDF with better text quality than canvas-to-PDF conversion.",
          ],
        },
        {
          heading: "Handling Multi-Party Conversations and Group Chats",
          paragraphs: [
            "Group chat mockups present additional layout complexity because they require displaying multiple sender identities, group administrator indicators, and message threading that may span multiple column tracks. The layout algorithm must handle variable avatar sizes, sender name lengths, and message timestamps without creating asymmetric whitespace.",
            "A robust group chat mockup implementation should support a configurable column layout: two-column for standard group chats with moderate message density, three-column for high-volume groups where message clustering by sender improves readability, and single-column timeline for chronological audit trails.",
            "Timestamp handling in group chats requires consideration of message grouping logic: messages within a 5-minute window from the same sender should be visually grouped to avoid redundant timestamp repetition, while messages from different senders always display their timestamp. This behaviour mirrors WeChat's native grouping logic and ensures the mockup feels authentic.",
          ],
        },
        {
          heading: "Best-practice tips",
          paragraphs: [
            "These conventions ensure reliable output quality and maintain the integrity of mockup workflows:",
          ],
        },
      ],
      bullets: [
        "Use avatar images at 2× the target display size to prevent upscaling artefacts on high-DPI displays.",
        "Apply visible watermarks to any mockup intended for external distribution, even if the recipient is expected to know the content is synthetic.",
        "Revoke Blob URLs immediately after triggering downloads to prevent memory leaks in long-running sessions.",
        "Limit image attachments to 2 MB maximum per item to keep memory consumption within safe bounds for mobile browsers.",
        "For audit-critical use cases, implement digital signing of mockup metadata to provide an verifiable provenance chain.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 微信 UI 与数字资产验证",
  title: "像素级聊天 Mockup：架构、安全与取证可识别性",
  lead:
    "微信 Mockup 生成器已成为设计工作室、编辑团队和营销机构不可或缺的生产力工具，用于在无需访问真实用户账号的情况下生成逼真的聊天截图。这些工具完全运行在浏览器端，通过基于 Canvas 的栅格化管线与 RFC 2397 Data URI 来组装像素级精准的聊天界面组件。本文深入剖析其渲染架构、安全边界与取证可识别性考量，为产品团队在企业级部署前提供全面的技术参考。",
  sections: [
    {
      id: "industry",
      heading: "行业背景与合规定位",
      lead:
        "消息平台界面在产品设计、编辑内容与营销素材中的广泛渗透，催生了一个专业工具品类。理解这些工具在设计生态中的位置及其承载的合规义务，是负责任部署的基础。",
      subsections: [
        {
          heading: "微信视觉语言在产品设计中的应用",
          paragraphs: [
            "微信的界面词汇——气泡布局、时间戳、已读回执、多媒体附件条——已经深深嵌入数字文化，成为「数字对话」的通用简写，无论底层平台是什么。产品设计师使用微信风格 Mockup 来原型化通知流、沟通对话状态机，以及在情境消息功能的叙事板设计，而无需构建完整的后端集成。",
            "将微信风格组件纳入设计系统时，通常将其视觉语法抽象为 tokenised 结构：气泡对齐（接收消息居左，发送消息居右）、头像尺寸（标准 40px）、时间戳精度（相对时间 vs. 绝对时间）、多媒体布局规则（固定宽高比的缩略图）。这种 tokenised 抽象允许同一组件库通过更换视觉主题层来生成多种消息平台输出。",
            "部署微信 Mockup 工具的企业设计团队必须确保工具的输出格式与目标交付物规格匹配。对于印刷编辑物，2× 设备像素比的 Canvas 导出确保在物理尺寸上的锐利渲染；对于数字原型，SVG 或 3× 高分辨率 PNG 提供了在高保真设计评审中所期望的精度。",
          ],
        },
        {
          heading: "Mockup 与真实截图的本质区别",
          paragraphs: [
            "区分「渲染合成微信对话的工具」与「产生与真实用户对话无法区分的图像的工具」，是一条关键的法律与伦理边界。前者是合法的设计资产；后者可能构成冒充、欺诈或虚假证据。",
            "合成 Mockup 图像对真实世界的事件或通讯不携带任何真实性。它们明确是设计人工制品——用于传达设计意图、说明 UX 流程，或在模板中填充内容而不暴露真实用户数据。一旦合成图像被呈现为真实通讯，工具的用途就从设计辅助转变为潜在的欺骗工具。",
            "Mockup 工具的行业最佳实践包括：对输出图像加水印以表明其合成性质；嵌入将图像标识为 Mockup 的元数据；以及提供清晰的 UI 标签以防止意外误用。面向公众分发微信 Mockup 图像的平台应实施可见水印；企业内部门工具可根据其威胁模型选择仅使用元数据方案。",
          ],
        },
        {
          heading: "伦理与法律边界",
          paragraphs: [
            "围绕合成消息图像的法律景观因司法管辖区而异。在微信拥有数十亿用户的中国，制造和分发声称是真实通讯的合成微信对话，可能触发《民法典》和《刑法》中关于名誉侵权、欺诈或扰乱商业关系的条款。",
            "对企业用户而言，最安全的部署模式将微信 Mockup 输出视为明确标注的设计材料。内部设计评审、利益相关者演示和开发者交接文档是低风险用例，因为受众知道内容是虚构的。高风险用例包括任何可能向合理相信内容是真实的第三方呈现 Mockup 的场景。",
            "部署 Mockup 工具的团队实用合规框架包括：任何面向外部共享的导出物强制加水印；明确禁止用户使用该工具创建误导性内容的用户协议；企业账号的生成事件审计日志；以及定期审查输出内容中的欺诈或冒充指标。",
            "跨多司法管辖区运营的国际组织应在每个运营地区维护一份关于 Mockup 使用许可性的法律意见，特别是当 Mockup 工具作为服务提供给外部客户时——这些客户可能将输出应用于工具提供商无法预见的场景。",
          ],
        },
        {
          heading: "微信 Mockup 工具在 B2B SaaS 领域的位置",
          paragraphs: [
            "微信 Mockup 工具市场已从简单的截图合成器成熟为与设计系统集成的平台，这些平台维护与微信 UI 演进对齐的组件库。企业设计团队根据以下标准评估这些工具：气泡渲染在各种设备形态（手机、平板、电脑）上的保真度；对微信全部消息类型（文本、图片、语音、视频、红包、小程序卡片）的支持；以及与 W3C Design Token 格式等设计 Token 标准的兼容性。",
            "嵌入微信 Mockup 功能的 B2B SaaS 平台通常在工作流集成上实现差异化：直接通过插件 API 导出到 Figma 和 Sketch；带 git 式 diff 的版本控制资产管理（用于对话状态）；以及与真实对话存档审查流程一致的协作评审与评论审批工作流。",
            "企业 Mockup 工具的定价模式通常遵循按席位或按工作区订阅，API 访问（当 Mockup 生成嵌入自动化内容管线时）按使用量计费。采购团队应争取审计权，以便验证使用量指标是否准确，因为客户端生成的透明度缺失使得独立验证生成数量变得困难。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 端侧渲染架构深解",
      lead:
        "微信 Mockup 生成的渲染管线完全运行在客户端，利用现代浏览器能力产生高保真栅格输出，无需任何服务端处理。理解技术架构对于评估这些工具用于企业部署的工程师至关重要。",
      subsections: [
        {
          heading: "2× 设备像素比 Canvas 栅格化",
          paragraphs: [
            "微信 Mockup 渲染的基础是一个配置为 2× 设备像素比（DPR）的高分辨率 Canvas 上下文。在标准显示器上，1 CSS 像素等于 1 物理像素；在高 DPI 显示器（Retina、现代 Android）上，1 CSS 像素映射到 2 个或更多物理像素。以 2× DPR 渲染确保输出图像在高 DPI 屏幕上显示或以物理尺寸打印时保持锐利。",
            "Canvas 以目标输出尺寸乘以 DPR 倍数进行初始化。对于 1080px 宽的对话导出，Canvas 元素本身宽 2160px，并在 CSS 尺寸上应用 2× 缩放变换。所有绘图操作——气泡路径、文本字形、头像图像——都在这个更高分辨率下执行，产出一个携带完整空间保真度的输出栅格。",
            "文本渲染使用 Canvas 2D 的 `measureText()` API 来计算匹配微信原生气泡宽度约束的换行。实现必须处理多行文本重排、表情符号尺寸和链接检测，且不依赖任何基于 DOM 的布局引擎，因为整个渲染发生在没有布局树的离屏 Canvas 上。",
          ],
        },
        {
          heading: "RFC 2397 Base64 编码 Data URI 管线",
          paragraphs: [
            "头像和图片附件管线使用 RFC 2397 Data URI 将二进制资源直接嵌入 Canvas 绘图命令。当用户提供头像图像时，工具将文件读取为 ArrayBuffer，编码为 Base64，并使用适当的 MIME 类型构造 Data URI：`data:image/png;base64,iVBORw0KGgo...`。",
            "然后 Data URI 被加载到内存中的 `Image` 对象，并使用 `drawImage()` 绘制到 Canvas 上。这条管线避免了创建需要显式撤销的对象 URL，并确保最终导出 Blob 不包含任何外部资源依赖——整个图像是自包含的。",
            "Base64 编码相对于原始二进制数据增加约 33% 的数据大小。对于嵌入 Mockup 对话中的大图片附件，此开销是可以接受的，因为整个文档在导出阶段保持在内存中。工程师应对超过 2 MB 的附件实施大小警告，以防止在受限设备上产生内存压力。",
          ],
        },
        {
          heading: "html2canvas 导出与 Blob URL 生命周期",
          paragraphs: [
            "当微信 Mockup 包含 HTML 格式化内容——富文本、嵌入式链接、样式化时间戳——时，混合渲染方法将 Canvas 栅格化与选择性 DOM 到 Canvas 的转换相结合，通过 html2canvas 或类似库实现。HTML 组件首先在离屏 DOM 容器中渲染，然后以配置的 DPR 栅格化到 Canvas。",
            "最终合成 Canvas 通过 `canvas.toBlob('image/png', 1.0)` 转换为 Blob。通过 `URL.createObjectURL(blob)` 创建 Blob URL，并立即用于下载触发。下载触发后，必须通过 `URL.revokeObjectURL()` 撤销 Blob URL，以防止在长时间运行的会话中内存泄漏。",
            "导出管线支持单图导出（一个对话）和批量导出（多个对话打包为 ZIP 存档）。批量导出使用 `Blob` 构造函数将多个 Canvas 渲染组装成单个存档，每个文件使用经过清理的时间戳模式命名：`wechat-mockup-{YYYYMMDD}-{HHMMSS}.png`。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 最佳实践",
      lead:
        "微信 Mockup 生成器是稳健的工具，但某些配置选择和环境因素可能降低输出质量或导致导出失败。本节涵盖最常见的失败模式及对应的补救策略。",
      subsections: [
        {
          heading: "为什么我的头像在导出后看起来模糊？",
          paragraphs: [
            "头像输出模糊几乎总是头像源图像与 Canvas 渲染上下文之间的 DPR 不匹配。如果源图像是 80×80px，而 Canvas 以 2× DPR 渲染，头像将从 80px 放大到 160px 有效像素——2× 放大揭示了摄影图像中的插值伪影。",
            "解决方案是提供最小 160×160px 的头像图像（1× 渲染）或 320×320px（2× 渲染）。设计团队应准备多分辨率层级的头像资源库：40×40（图标用）、80×80（内联用）、160×160（Mockup 主用）。这种分层方法确保工具始终选择尺寸合适的输入。",
            "如果源图像无法调整大小（例如用户提供的照片），请将 Canvas 渲染配置为对像素艺术风格头像使用 `imageSmoothingEnabled = false`，或对摄影内容使用 `imageSmoothingQuality = 'high'`。后者使用双三次插值，在适度的放大倍数下产生感知上更平滑的结果。",
          ],
        },
        {
          heading: "如何识别 Mockup 与真实截图",
          paragraphs: [
            "微信 Mockup 与真实截图的取证分析涉及检查元数据、压缩伪影和结构一致性。真实截图在 EXIF 头中携带设备特定元数据（制造商、型号、软件版本）；来自基于 Canvas 工具的合成导出不携带 EXIF 数据或携带默认生成器签名。",
            "像素级取证信号包括：统一的字体渲染（Canvas 文本以一致的字形权重渲染，而原生截图使用设备字体栅格化伴随细微变化）、一致的气泡几何（Mockup 气泡具有统一的角半径，而真实截图反映特定设备 DPI 下的渲染）、以及状态栏元素的缺失（真实截图包含设备状态栏及信号强度和时间；Mockup 通常省略此部分）。",
            "对于高欺诈风险的机构，对 Mockup 导出进行数字签名提供了可审计的溯源链。在图像元数据中嵌入 HMAC 签名，允许下游验证图像由授权工具生成，且在生成后未被篡改。",
          ],
        },
        {
          heading: "大型聊天历史记录的性能考量",
          paragraphs: [
            "渲染包含数百条消息的 Mockup 对话可能会给浏览器内存带来压力，特别是在 RAM 受限的设备上，或者当消息包含多个大型图片附件时。作为 Data URI 加载的每个图片附件消耗的内存与其解码大小成正比，而非其压缩文件大小。",
            "推荐的缓解策略是分页：将大型对话拆分为每段 50 条消息的分段，将每个分段渲染为独立的 Canvas，并将最终导出组成为多页文档或平铺图像网格。这种方法保持峰值内存消耗有界，并为评审工作流提供自然的分块。",
            "对于处理大量 Mockup 生成量的企业部署，考虑实现基于 Web Worker 的渲染管线，将 Canvas 操作卸载到后台线程。主线程保持对 UI 交互的响应，而 Worker 执行栅格化，并使用 `postMessage()` 将最终 Blob 传回主线程进行导出。",
          ],
        },
        {
          heading: "导出格式选择：PNG vs SVG vs PDF",
          paragraphs: [
            "导出格式的选择取决于下游用例。PNG 是 Web 嵌入、社交媒体以及任何需要任意尺寸显示的场景的默认选择。来自 Canvas 的 2× DPR PNG 导出在图像编辑器中缩放或在高清显示器上显示时保持锐利。",
            "SVG 导出在 Mockup 需要在矢量图形软件（Figma、Illustrator、Sketch）中编辑，或者输出需要保持可缩放而不出现质量下降时是首选。然而，从基于 Canvas 的 Mockup 工具导出 SVG 在技术上是复杂的，因为通过 Canvas `fillText()` 渲染的文本会被栅格化为路径——在矢量编辑器中文本不再可编辑。",
            "PDF 导出适用于 Mockup 将被打印或包含在将被打印的文档中的场景。PDF 在保持形状的矢量完整性的同时，将栅格化文本嵌入为内嵌字体或矢量路径。对于包含微信对话 Mockup 的大容量自动化报告生成，无头浏览器服务（Puppeteer 或 Playwright）可以渲染 HTML 模板到 PDF，其文本质量优于 Canvas 转 PDF 的方式。",
          ],
        },
        {
          heading: "处理多聊会话与群聊",
          paragraphs: [
            "群聊 Mockup 带来额外的布局复杂性，因为它们需要显示多个发送者身份、群管理员指示器，以及可能跨越多列轨道的消息线程。布局算法必须处理可变的头像尺寸、发送者名称长度和消息时间戳，而不会产生不对称的空白。",
            "稳健的群聊 Mockup 实现应支持可配置的列布局：中等消息密度的标准群聊使用双列；高容量群聊使用三列以通过发送者对消息进行聚类来提高可读性；以及用于按时间顺序的审计追踪的单列时间线。",
            "群聊中的时间戳处理需要考虑消息分组逻辑：来自同一发送者的 5 分钟窗口内的消息应在视觉上分组，以避免冗余的时间戳重复；来自不同发送者的消息始终显示其时间戳。这种行为反映了微信原生的分组逻辑，并确保 Mockup 感觉真实。",
          ],
        },
        {
          heading: "实用小技巧",
          paragraphs: [
            "以下这些约定确保可靠的输出质量并维护 Mockup 工作流的完整性：",
          ],
        },
      ],
      bullets: [
        "使用 2× 目标显示尺寸的头像图像，以防止在高 DPI 显示器上出现放大伪影。",
        "对任何面向外部分发的 Mockup 应用可见水印，即使接收者被预期知道内容是合成的。",
        "触发下载后立即撤销 Blob URL，以防止在长时间运行的会话中内存泄漏。",
        "将图片附件限制为每个项目最大 2 MB，以保持移动浏览器的内存消耗在安全范围内。",
        "对于需要审计的关键用例，实施 Mockup 元数据的数字签名，以提供可验证的溯源链。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;