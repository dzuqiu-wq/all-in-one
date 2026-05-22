import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · QR CODE STANDARDS & GENERATION",
  title: "The 1994 specification that runs the modern mobile economy",
  lead:
    "QR codes were invented in 1994 to track Toyota auto parts. Three decades later they are how billions of people pay rent, log into Wi-Fi networks, board flights, and authenticate into corporate systems. The standard behind them — ISO/IEC 18004 — is remarkably tight, and that tightness is exactly what makes a good generator a study in faithful implementation rather than creative engineering.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "QR codes are governed by an international standard. Generators that diverge from the standard produce codes that scan inconsistently across the long tail of mobile cameras. This section maps the specification to the choices you make in our UI.",
      subsections: [
        {
          heading: "ISO/IEC 18004 and the Reed-Solomon foundation",
          paragraphs: [
            "ISO/IEC 18004 — the QR Code specification, revised most recently in 2015 — defines the geometry, the encoding modes, the masking patterns, and the Reed-Solomon error-correction polynomials that together turn a string of bytes into the familiar square barcode. The Reed-Solomon coding is what lets a QR code survive partial damage: at error-correction level H (high), up to 30% of the modules can be obliterated and the code is still recoverable.",
            "The standard defines four error-correction levels (L, M, Q, H), four encoding modes (numeric, alphanumeric, byte, Kanji), 40 size versions (from 21×21 to 177×177 modules), and eight masking patterns that bias the dark-light module distribution to optimise scannability under various lighting conditions. Our generator follows the standard exactly; we do not invent new modes or skip the masking optimisation step.",
          ],
        },
        {
          heading: "Use cases and the matching encoding modes",
          paragraphs: [
            "Different payloads are most efficiently encoded by different modes. A pure URL fits in byte mode. A telephone number fits in numeric mode. A flight boarding pass fits in byte mode with the BCBP (Bar Coded Boarding Pass) IATA layout. Wi-Fi credentials fit in byte mode using the `WIFI:T:WPA;S:network;P:password;;` syntax. vCard contact records fit in byte mode using the canonical vCard 3.0 / 4.0 format.",
            "Our generator detects payload type heuristically (URLs starting with `http://` or `https://`, telephone numbers starting with `+`, WIFI strings using the formal syntax) and surfaces appropriate guidance. For unknown payloads, byte mode is the safe default — it accepts arbitrary UTF-8 with a small efficiency penalty relative to mode-specific encoding.",
          ],
        },
        {
          heading: "Where QR codes show up in regulated contexts",
          paragraphs: [
            "Regulations have started catching up with QR ubiquity. PCI DSS 4.0 explicitly mentions QR codes for payment authorisation. The EU's Digital Markets Act references QR-based identity flows. China's Cybersecurity Law and India's Personal Data Protection Bill both treat QR-encoded personal data as in-scope for processing limitations. Mexico's CFDI 4.0 invoicing standard requires a 2D bar code (Code 128 or QR) on every printed invoice.",
            "In all these cases the regulator's question is not 'is the code valid' but 'can the contents of the code be traced back to a person, and if so, under what consent'. Our generator produces codes whose content you control; the regulatory compliance burden remains with the data controller (you), not the toolmaker.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "QR encoding is one of those areas where the spec is dense enough that re-implementing it from scratch is a six-month project. We use the qrcode.react library, which has been battle-tested across millions of websites, and concentrate our engineering on the UI side: real-time rendering, dual-format export, and accessible colour validation.",
      subsections: [
        {
          heading: "Dual-renderer modes: SVG and Canvas",
          paragraphs: [
            "qrcode.react exposes two rendering pipelines. SVG mode emits a vector `<svg>` element whose `<path>` elements form the dark modules. Canvas mode draws the modules into a `<canvas>` using `fillRect` calls. The choice between them is not aesthetic — it is operational.",
            "SVG scales without aliasing to any output size, which makes it ideal for print: a 256×256 px SVG QR code remains crisp when printed on a 4 cm × 4 cm physical label or scaled to a 30 cm × 30 cm poster. Canvas is better when you need to embed a raster logo in the centre of the code, because compositing logos onto a canvas is straightforward while compositing them onto an SVG requires foreignObject hacks. We default to SVG and switch to Canvas only when the user picks the logo-embed option.",
          ],
        },
        {
          heading: "Real-time rendering on every keystroke",
          paragraphs: [
            "The QR rendering pipeline is fast enough that we re-render on every keystroke. The `text` state is bound to a `useState` hook in React; on each change, qrcode.react re-encodes the payload, re-runs the masking-pattern selection, and emits new module coordinates. The result is the familiar magic: as you type a URL, the code visibly densifies in front of you.",
            "We make no attempt to debounce typing because there is no need. The encoding cost is in the low microseconds; the React render is the bottleneck and React itself is fast enough at this scale that a 60 fps update budget is comfortably preserved.",
          ],
        },
        {
          heading: "Foreground and background colour validation",
          paragraphs: [
            "Custom QR colours look great until they do not scan. The standard requires high contrast between dark and light modules; QR scanners apply a luminance threshold during binarisation, and code points whose dark module is, say, dark red (luminance ~50) versus a light pink background (luminance ~220) confuse the binariser because the scanner reads `red` as dark and `pink` as light, but with insufficient margin.",
            "Our colour validator computes the relative luminance ratio between the user-entered foreground and background hex values using the WCAG contrast formula. Below 7:1 we surface an inline warning. Below 4:1 we refuse to render and pin the rendered output to a safe black-on-white fallback. Five preset palettes are pre-validated and recommended for users who do not want to think about contrast at all.",
          ],
        },
        {
          heading: "Export pipeline: PNG, SVG, and clipboard",
          paragraphs: [
            "Three export targets are supported. PNG is the universally embeddable raster format: we use Canvas to draw the SVG at the user-selected size and call `canvas.toBlob('image/png')`. SVG is preserved directly via `XMLSerializer().serializeToString(svgElement)` and offered as a download. Clipboard export uses the modern `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])` API, which works in every major browser since 2022.",
            "Filenames are templated as `qrcode-{timestamp}.png` to avoid filename collisions when generating dozens of codes in sequence (e.g., a batch of event-attendee badges).",
          ],
        },
        {
          heading: "Security: why we reject non-hex colour input",
          paragraphs: [
            "Colour inputs are a classic XSS vector. A naive implementation that accepts `colour` as an arbitrary string and pipes it into a `style` attribute is one CSS-injection step from arbitrary script execution via CSS expression evaluation in older Edge / IE.",
            "Our validator strictly enforces the `#RGB` and `#RRGGBB` hex patterns via a regex applied at the moment of input. Any character that does not fit the pattern — including `<`, `\"`, `;`, `:`, and spaces — is rejected outright with an inline error. The internal colour state is never updated with invalid input, so the rendered output remains pinned to the last known-good value.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "QR code failures are almost always one of three categories: the code does not scan, the code is the wrong shape for the medium it is printed on, or the code encodes something different from what the user expected. The recipes below cover the dominant failure modes.",
      subsections: [
        {
          heading: "The code looks correct but does not scan",
          paragraphs: [
            "Three things conspire most often. First, contrast: as discussed above, our validator warns when contrast drops below 7:1, but if you manually override the warning, scanners may struggle. Switch to the Editorial or Deep Ink preset and try again.",
            "Second, size at print: if you print at a physical size where each QR module is under 0.5 mm wide, even high-resolution scanners struggle. Use the size slider to push the digital image up to at least 512 px and resize at the print stage instead of relying on browser-level scaling.",
            "Third, the so-called quiet zone: the QR specification requires a clear margin equal to four modules around the code. If your design hugs the QR with text or other graphics inside that margin, scanners refuse to lock on. Our `includeMargin={false}` default reserves the quiet zone via the background colour; if you crop the output you must reserve it manually.",
          ],
        },
        {
          heading: "I want to embed a logo in the centre — how big can it be?",
          paragraphs: [
            "Logo overlay relies on error correction to mask the obscured modules. At error-correction level H (the standard's highest), up to 30% of modules can be lost. To allow a 25% headroom for printing damage, we recommend logos no larger than 20% of the code's area.",
            "Switch the error-correction level to H from the dropdown before adding a logo, and prefer a square logo with a rounded background that matches the QR's background colour. A circular logo on a square background looks polished and helps the scanner re-acquire after a brief disruption.",
          ],
        },
        {
          heading: "My WiFi QR code joins the wrong network",
          paragraphs: [
            "WiFi credentials must be encoded in the exact `WIFI:T:WPA;S:NetworkName;P:Password;;` format with a trailing semicolon-semicolon terminator. The `T:` field accepts `WPA`, `WEP`, or `nopass`. Special characters in the SSID or password must be escaped with backslashes — particularly `;`, `,`, `:`, `\\`, and `\"`.",
            "If your QR joins the wrong network, the most likely explanation is an unescaped semicolon in your SSID or password. Manually escape them by typing `\\;` instead of `;` in the corresponding field.",
          ],
        },
        {
          heading: "Different phones see different things in the same QR",
          paragraphs: [
            "Android and iOS native camera apps handle URL prefixes differently. iOS strips `https://` prefixes when displaying the destination but visits the full URL; Android shows the full string. This is occasionally confusing during user testing but does not indicate a generator bug.",
            "Specialist scanner apps may parse vCard fields differently from native camera apps. If you target a specialist app (event check-in, inventory scanning), test with that specific app rather than the system camera.",
          ],
        },
        {
          heading: "Best-practice tips",
          paragraphs: [
            "These conventions keep QR workflows reliable across print and digital channels:",
          ],
        },
      ],
      bullets: [
        "Default to error-correction level M; raise to Q or H only if the code will be printed on an exposed surface or includes a logo.",
        "Print at a minimum of 2-3 mm per QR module — anything smaller risks scan failures even with high-resolution cameras.",
        "Preserve the quiet zone (a clear margin equal to four modules) — do not crop it or fill it with text.",
        "Test the printed code with at least two phones (one Android, one iOS) before final dispatch.",
        "For URL payloads, prefer short canonical URLs over long tracking-parameter-laden ones — denser codes are harder to scan on small media.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 二维码标准与生成",
  title: "支撑现代移动经济的 1994 年规范",
  lead:
    "二维码 1994 年发明，最初是用来追踪丰田汽车零部件的。三十年后，它成了几十亿人付房租、登 Wi-Fi、登机、给企业系统做身份验证的入口。背后的标准 ISO/IEC 18004 非常严密——而这份严密恰好让一个「好的生成器」更像是「忠实实现规范」而非「创造性发挥」。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "二维码由国际标准管辖。不遵循标准的生成器，所产出的码在长尾的各种手机相机上会扫得忽好忽坏。本节把规范映射到我们 UI 上你所做的每一个选择。",
      subsections: [
        {
          heading: "ISO/IEC 18004 与 Reed-Solomon 纠错根基",
          paragraphs: [
            "ISO/IEC 18004——二维码规范，最近一次修订是 2015 年——定义了几何形状、编码模式、掩码图案，以及把一串字节变成熟悉方形条码的 Reed-Solomon 纠错多项式。Reed-Solomon 纠错正是让 QR 在部分破损时仍可恢复的核心：在 H（高）级纠错下，最多可损失 30% 模块仍可被解出。",
            "标准定义了 4 个纠错级别（L, M, Q, H）、4 种编码模式（数字、字母数字、字节、汉字）、40 个尺寸版本（从 21×21 到 177×177 模块），以及 8 种掩码图案，用于偏置「明 / 暗」模块分布以适配不同光照。我们的生成器严格遵守规范——不发明新模式，不跳过掩码优化步骤。",
          ],
        },
        {
          heading: "使用场景与对应的编码模式",
          paragraphs: [
            "不同 payload 由不同模式最高效编码。纯 URL 用字节模式；电话号码用数字模式；登机牌用字节模式 + IATA 的 BCBP（Bar Coded Boarding Pass）版式；Wi-Fi 凭证用字节模式 + `WIFI:T:WPA;S:网络名;P:密码;;`；vCard 联系人用字节模式 + 标准 vCard 3.0 / 4.0 格式。",
            "我们的生成器会根据 payload 的形状做启发式识别（`http://`/`https://` 开头视作 URL；`+` 开头视作电话；遵循 WIFI 语法的视作 Wi-Fi 凭证），并展示相应提示。对未知 payload，字节模式是安全默认——它接受任意 UTF-8，相对模式特化只是有点儿效率损失。",
          ],
        },
        {
          heading: "二维码在合规场景里的位置",
          paragraphs: [
            "监管已经逐渐跟上二维码的普及。PCI DSS 4.0 显式提及二维码用于支付授权；欧盟数字市场法案提到基于 QR 的身份流程；中国《网络安全法》与印度《个人数据保护法案》都把 QR 编码的个人数据纳入处理限制范畴；墨西哥 CFDI 4.0 开票标准要求每张打印发票上都有 2D 条码（Code 128 或 QR）。",
            "所有这些场景里监管的真正问题不是「码本身是否合规」，而是「码里的内容能否追溯到某个具体的人，如果能，是基于什么同意」。我们的生成器只是把你给定的内容编码成图案；合规责任仍然在数据控制者（即你）那一侧。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "二维码编码规范密度极高，从零重新实现是一个六个月的项目。我们使用 qrcode.react——已经在数百万网站上久经考验——并把工程精力放在 UI 层：实时渲染、双格式导出、以及可访问的颜色校验。",
      subsections: [
        {
          heading: "双渲染模式：SVG 与 Canvas",
          paragraphs: [
            "qrcode.react 暴露两条渲染管线。SVG 模式输出矢量 `<svg>`，其 `<path>` 元素构成深色模块；Canvas 模式则在 `<canvas>` 上用 `fillRect` 画模块。二者的取舍不是审美问题，而是运营问题。",
            "SVG 可以无锯齿缩放到任意尺寸，适合打印：256×256 的 SVG QR 在 4 cm × 4 cm 物理标签上和 30 cm × 30 cm 海报上都保持锐利。Canvas 更适合「在中心嵌入栅格 Logo」——把 Logo 合成到 Canvas 上很直接，而合成到 SVG 上要靠 foreignObject 这类奇技。我们默认 SVG，仅在用户开启「嵌入 Logo」时切到 Canvas。",
          ],
        },
        {
          heading: "每按一个键都实时重绘",
          paragraphs: [
            "QR 渲染管线足够快，以至于我们可以在每次按键时整张重绘。文本绑定到 React 的 `useState`，每次变化时 qrcode.react 重新编码 payload、重跑掩码图案选择、生成新的模块坐标。结果就是熟悉的「神奇感」：你边打 URL，二维码就在眼前逐步加密。",
            "我们没有做防抖，也不需要做。编码本身只在微秒级；React 渲染才是瓶颈，而 React 在这个规模下完全能保持 60 fps 的更新预算。",
          ],
        },
        {
          heading: "前景色与背景色的对比度校验",
          paragraphs: [
            "自定义颜色看起来很美，直到扫不出来。规范要求深 / 浅模块间高对比；扫描器在二值化阶段会施加亮度阈值，深红（亮度 ~50）配浅粉（亮度 ~220）即使数学上「深 vs 浅」明确，对人眼可以但对扫描器边界过窄，仍会失败。",
            "我们用 WCAG 对比度公式计算用户输入的前景 / 背景十六进制亮度比。低于 7:1 时行内警告；低于 4:1 时直接拒绝渲染，把输出钉在安全的黑底白底回落上。同时提供 5 套预设调色板，覆盖「完全不想思考对比度」的用户。",
          ],
        },
        {
          heading: "导出管线：PNG、SVG、剪贴板",
          paragraphs: [
            "我们支持三种导出。PNG 是兼容最广的栅格：用 Canvas 以用户选择的尺寸重画 SVG，然后 `canvas.toBlob('image/png')`。SVG 通过 `XMLSerializer().serializeToString(svgElement)` 直接保留并以下载形式提供。剪贴板使用现代 `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])` API，自 2022 年起所有主流浏览器都支持。",
            "文件名模板化为 `qrcode-{timestamp}.png`，避免连续生成几十张（比如活动签到牌）时撞名。",
          ],
        },
        {
          heading: "安全：为什么我们拒绝非十六进制颜色输入",
          paragraphs: [
            "颜色输入是经典 XSS 入口。如果天真地把「颜色」当成任意字符串塞进 `style` 属性，距离任意脚本执行只差一步——比如在老 Edge / IE 上利用 CSS expression 求值。",
            "我们在输入时严格用正则强制 `#RGB` / `#RRGGBB` 模式。任何不在模式内的字符——`<`、`\"`、`;`、`:`、空格——一律行内报错拒绝。内部颜色 state 从不被无效输入更新，渲染输出永远钉在最近一次已知良好的值上。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "二维码失败几乎都落在三类：码扫不出、码尺寸与媒介不匹配、码编码的不是用户以为的东西。下面是覆盖率最高的几条与对应解法。",
      subsections: [
        {
          heading: "看起来对的码却扫不出来",
          paragraphs: [
            "通常是三件事在合谋。第一是对比度：如前所述，对比度低于 7:1 我们会警告；如果你手动忽略了警告，扫描器就会挣扎。换 Editorial 或 Deep Ink 预设再试。",
            "第二是打印物理尺寸：如果你打印后每个 QR 模块小于 0.5 mm，即便高分辨率扫描器也吃力。先用滑块把数字图像推到至少 512 px，再在打印阶段缩放，而不是依赖浏览器层缩放。",
            "第三是「静默区」：QR 规范要求码周围有相当于 4 个模块宽的空白边距。如果你的设计把文字或图形塞进这个边距里，扫描器会拒绝锁定。我们默认 `includeMargin={false}`，依赖背景色保留静默区；如果你后处理时裁掉了边距，请务必手动补回去。",
          ],
        },
        {
          heading: "想在中心嵌 Logo，最大多大？",
          paragraphs: [
            "嵌入 Logo 靠纠错码来「遮蔽」被覆盖的模块。在 H 级纠错下最多可损失 30%；为打印损伤再预留 25% 余量，我们建议 Logo 不超过码面积的 20%。",
            "嵌入 Logo 前先把纠错级别从下拉切到 H。优先方形 Logo + 圆角背景，且背景色与 QR 背景一致；这样扫描器在 Logo 边缘被短暂遮挡时能迅速重新锁定。",
          ],
        },
        {
          heading: "我的 Wi-Fi QR 连到了错的网络",
          paragraphs: [
            "Wi-Fi 凭证必须用精确格式 `WIFI:T:WPA;S:NetworkName;P:Password;;`（注意结尾的双分号）。`T:` 接受 `WPA`、`WEP`、`nopass`。SSID 或密码中的特殊字符要用反斜杠转义——尤其 `;`、`,`、`:`、`\\`、`\"`。",
            "如果连到了错的网络，最可能是 SSID 或密码里有未转义的分号。手动把它们替换为 `\\;` 即可。",
          ],
        },
        {
          heading: "不同手机扫同一张 QR 看到不同内容",
          paragraphs: [
            "Android 与 iOS 原生相机对 URL 前缀的处理不一致：iOS 显示时会剥掉 `https://` 但访问的还是完整 URL；Android 显示完整字符串。这在用户测试时偶尔造成困惑，但并不代表生成器有 Bug。",
            "专业扫描器 App（活动签到、库存盘点）对 vCard 字段的解析也可能与系统相机不同。如果你的目标是某款特定 App，请用该 App 测试，而不是系统相机。",
          ],
        },
        {
          heading: "实用小技巧",
          paragraphs: [
            "下面这些约定能让二维码工作流在印刷与数字渠道之间保持可靠：",
          ],
        },
      ],
      bullets: [
        "默认纠错级别 M；仅当码会被印在曝露表面或包含 Logo 时才升到 Q 或 H。",
        "打印时确保每个 QR 模块不小于 2-3 mm——再小，即使高分辨率相机也会扫失败。",
        "保留「静默区」（约 4 模块宽的空白边距）——不要裁掉、也不要用文字填进去。",
        "正式分发前用至少两部手机（一安卓一 iOS）测试打印后的码。",
        "URL 类 payload 优先使用短链接而非带一堆跟踪参数的长 URL——码越密，在小媒介上越难扫。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
