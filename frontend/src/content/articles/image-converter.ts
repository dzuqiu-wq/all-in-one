import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CANVAS RE-ENCODING",
  title:
    "PNG, JPEG, WebP in 2026: choosing the right encoder, and why your browser can already do it",
  lead:
    "Every modern browser ships a hardware-accelerated PNG, JPEG, and WebP encoder behind `canvas.toBlob()`. A correct format converter is therefore a four-step pipeline — decode the source, draw onto a Canvas, re-encode in the target format, hand the user a Blob. The hard parts are not the math; they are knowing which format is the right destination for the content you have, what the quality slider actually does, and where the workflow quietly breaks (animated GIFs, very large images, color profile loss). This page is the contract under our tool: what we convert, how we convert it, and which formats we deliberately do not produce.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Image format choice is one of those areas where the right answer depends entirely on what is in the image. The W3C, IETF, and major browser engines have converged on three workhorse formats — PNG, JPEG, WebP — that together cover essentially every web use case. Picking among them correctly is a five-second decision once you internalize the rules.",
      subsections: [
        {
          heading: "PNG — pixel-perfect screenshots, line art, transparency",
          paragraphs: [
            "PNG was standardised by W3C/ISO in 2003 (ISO/IEC 15948) as a patent-free replacement for GIF. It is lossless: every pixel that goes in comes out exactly. The encoder applies a filter pass to predict each pixel from its neighbours, then runs the residual through DEFLATE. This works extremely well for content with large flat regions and sharp edges — screenshots, UI mockups, logos, line art, anything with text rendered into the image. It works poorly for photographs, where every pixel differs slightly from its neighbours and DEFLATE has nothing to compress.",
            "PNG also supports an 8-bit alpha channel for transparency. This is non-negotiable for logos that need to sit on arbitrary backgrounds, icons, and any image that will be composited later. If your source has transparent pixels and you convert to JPEG, those pixels become opaque white (or whatever the canvas background colour is) — there is no recovering the transparency once it is gone.",
            "Use PNG when: the image contains text, the image contains transparency, the image is a screenshot, or the image will be edited again later. Avoid PNG for photographs — a 4 MB PNG of a landscape will compress to ~400 KB as a high-quality JPEG with no perceptible loss.",
          ],
        },
        {
          heading: "JPEG — photographs, gradients, anything continuous-tone",
          paragraphs: [
            "JPEG (ISO/IEC 10918-1, 1992) is the format every camera and every photo workflow has used for thirty years. It is lossy: the encoder breaks the image into 8×8 blocks, applies a discrete cosine transform, quantises the coefficients (the lossy step), and Huffman-codes the result. Quality settings directly control the quantisation table — quality 85 keeps most coefficients; quality 50 throws most of them away.",
            "JPEG is excellent for content with smooth gradients and natural variation — photographs, paintings, anything where neighbouring pixels share most of their information. It is terrible for content with sharp edges and text, where the 8×8 block structure becomes visible as ringing artifacts around contrasting regions. If you have ever seen a JPEG of a screenshot with halos around the letters, you have seen JPEG used on the wrong content type.",
            "JPEG does not support transparency. It also has no animation support and no embedded color profile by default (though most encoders include an sRGB ICC tag). For photographs delivered over the web, JPEG at quality 85 is the industry-standard sweet spot — files are roughly one-tenth the size of an equivalent PNG with no perceptible quality loss.",
          ],
        },
        {
          heading: "WebP — the newer default, lossy or lossless, with transparency",
          paragraphs: [
            "WebP (Google, 2010; RFC 9649, 2024) is the format that should be your default for new web delivery. It supports both lossy encoding (via the VP8 intra-frame codec) and lossless encoding (a custom dictionary-coded format), plus full alpha transparency in both modes. The lossy mode produces roughly 25–35% smaller files than JPEG at equivalent visual quality; the lossless mode produces roughly 26% smaller files than PNG.",
            "Browser support reached effective universality in 2020 (Safari 14 was the last major holdout). As of 2026, WebP is the right default for any image delivered to a browser unless you have a specific reason to use something else (handing the file to a non-web consumer, archival compatibility, or a downstream tool that does not parse WebP).",
            "WebP quality settings do not map identically to JPEG quality. WebP quality 75 is roughly equivalent to JPEG quality 90 — the WebP encoder is more efficient, so a given perceptual quality requires fewer bits. If you are converting JPEG to WebP for size, start at WebP quality 80 and adjust from there.",
          ],
        },
        {
          heading: "Why no AVIF in this tool",
          paragraphs: [
            "AVIF (AV1 Image File Format) is the next-generation format, with roughly 50% smaller files than WebP at equivalent quality. It is supported by every major browser as a decoder. The catch is encoding: `canvas.toBlob('image/avif', ...)` is not universally implemented as of 2026 — Chrome and Edge encode it, Safari and Firefox do not. Shipping AVIF encoding in this tool would mean some users see the option work and others see it silently fall back to PNG.",
            "If you need AVIF specifically, use a dedicated encoder (`squoosh.app`, `sharp` on the command line, or `@jsquash/avif` in a Web Worker). When `canvas.toBlob()` supports AVIF across all engines, we will add it here.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Our converter is one function on top of two platform primitives: `createImageBitmap` and `canvas.toBlob`. The interesting engineering is in handling the corner cases — color profile preservation, memory management for large images, and recognising when the workflow is structurally wrong for the input.",
      subsections: [
        {
          heading: "Step 1 — `createImageBitmap` decodes off the main thread",
          paragraphs: [
            "We could decode the image with `new Image()` and an `img.src` data URL, then draw the `img` onto a canvas. That works, but the decode happens synchronously on the main thread and blocks the UI on large files. `createImageBitmap(file)` decodes asynchronously off-thread and returns a GPU-friendly `ImageBitmap` that draws to a canvas in constant time regardless of source size.",
            "The bitmap holds a GPU resource (or a memory-resident decoded pixel buffer). We call `bitmap.close()` in a `finally` block after the canvas draw so the resource is released immediately instead of waiting for the next GC cycle. On a converter that loops over many files, forgetting this leak can balloon memory by hundreds of megabytes.",
          ],
        },
        {
          heading: "Step 2 — `canvas.toBlob` is the encoder",
          paragraphs: [
            "Once the bitmap is drawn onto a canvas, `canvas.toBlob(callback, mimeType, quality)` invokes the browser's native encoder for the requested MIME type. PNG ignores the quality argument (lossless); JPEG and WebP map quality to encoder-specific parameters (JPEG quantisation tables, WebP rate-distortion targets).",
            "The callback is async — encoding a large image can take tens of milliseconds. We wrap it in a Promise so the caller can `await` the result. If the encoder fails (which can happen for very large canvases that exceed the per-engine pixel limit), the callback receives `null` and we reject with `Error('Failed to encode image')`.",
          ],
        },
        {
          heading: "Step 3 — Quality semantics differ across formats",
          paragraphs: [
            "Our slider passes a 0–1 number to `canvas.toBlob`. For PNG, that number is silently discarded. For JPEG, it maps directly to standard JPEG quality (0 = maximum compression / minimum quality, 1 = minimum compression / maximum quality). For WebP, browsers implement the spec slightly differently — Chrome uses libwebp's `WebPConfig.quality`, Firefox uses an internal mapping, Safari uses its own encoder. The visual result at quality 0.85 is close enough across engines that users do not notice the difference, but the byte counts can vary by 10–20%.",
            "Practical recommendation: JPEG quality 0.85 is near-visually-lossless for photographs. WebP quality 0.75 is roughly equivalent in perceived quality and produces smaller files. Above 0.95, you get diminishing returns — files grow rapidly with no visible improvement. Below 0.60, compression artifacts become obvious in flat regions and around edges.",
          ],
        },
        {
          heading: "Step 4 — Color profiles and the sRGB assumption",
          paragraphs: [
            "Canvas re-encoding does NOT preserve the source image's ICC color profile. The decoder reads the source into the browser's internal color space (effectively sRGB for compatibility), and the encoder emits the output as sRGB. If your source is a wide-gamut Display P3 photograph, the converted file will be tagged sRGB and the wide-gamut colours will be clipped.",
            "For 99% of web use cases this is fine — every browser, every consumer device, every social platform assumes sRGB. For photography workflows that need P3 or Adobe RGB preservation, this tool is the wrong choice; use `sharp` or ImageMagick on the command line with explicit `--icc` flags.",
          ],
        },
        {
          heading: "Step 5 — Animated GIF and animated WebP lose animation",
          paragraphs: [
            "`createImageBitmap` decodes only the first frame of an animated source. If you feed an animated GIF or animated WebP into this converter, the output will be a single still frame — the animation is silently lost. There is no warning because the platform does not expose a way to detect 'this source has more frames' without parsing the file format manually.",
            "If you need to convert an animated image to another animated format, this is the wrong tool. Use `ffmpeg`, `gifski`, or a dedicated WebP encoder with multi-frame support.",
          ],
        },
        {
          heading: "Step 6 — The 10 MB size limit",
          paragraphs: [
            "We enforce a 10 MB upload limit in the UI. The technical reason: `createImageBitmap` of a 50 MB image allocates roughly 50 MB on the GPU side plus the decoded pixel buffer (width × height × 4 bytes), which can easily exceed 200 MB for a 24-megapixel photo. On memory-constrained devices (phones, low-end laptops), this triggers the browser's out-of-memory handler and crashes the tab.",
            "10 MB is generous for any image that needs to ship over the web. If you are converting a 50 MB camera RAW or a 30 MB scanned TIFF, you are operating outside the regime this tool is designed for — use a desktop converter.",
          ],
        },
        {
          heading: "Step 7 — The browser tab is the entire trust boundary",
          paragraphs: [
            "Everything runs inside the engine instance that loaded this page. The image never leaves the tab. There is no Service Worker logging file contents, no `fetch` to a backend, no `localStorage` write. The file's bytes live in `FileReader` and `ImageBitmap` memory and are garbage-collected when you reset or close the tab.",
            "That property matters because images often carry metadata you did not intend to share — EXIF GPS coordinates, camera serial numbers, capture timestamps. Canvas re-encoding inherently strips all EXIF metadata, because the image is rasterised through the GPU and re-emitted from raw pixel data. Privacy by architecture, not by promise.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Almost every conversion problem traces back to one of four root causes: wrong format for the content type, animation lost, color profile mismatch, or input too large. Each is recognisable in seconds once you know the pattern.",
      subsections: [
        {
          heading: "Output JPEG has ugly halos around text or sharp edges",
          paragraphs: [
            "You converted content with sharp edges (a screenshot, line art, a logo) to JPEG. The 8×8 block DCT in JPEG cannot represent sharp transitions efficiently, so it spreads the energy of the edge into surrounding pixels — visible as ringing artifacts.",
            "Convert to PNG or lossless WebP instead. JPEG is for photographs; using it on UI screenshots produces visibly worse output at any quality setting.",
          ],
        },
        {
          heading: "Converted file is larger than the original",
          paragraphs: [
            "Two common causes. First, you converted a JPEG to PNG: JPEG is already lossy-compressed, so re-encoding the decoded pixels as PNG produces a much larger file. Always convert in the lossy → lossless direction with intent, not by accident.",
            "Second, you converted a photograph to lossless WebP or PNG. Lossless formats cannot compete with lossy formats on natural-tone content; expect 10–20× size growth. Use lossy WebP or JPEG for photographs.",
          ],
        },
        {
          heading: "Transparency became white (or black) in the output",
          paragraphs: [
            "JPEG does not support transparency. When you convert a transparent PNG or WebP to JPEG, the canvas background colour (white by default) fills the transparent regions, and the alpha channel is discarded.",
            "If you need transparency in the output, target PNG or WebP. WebP supports alpha in both lossy and lossless modes, so it is the right choice for transparent web graphics needing small file sizes.",
          ],
        },
        {
          heading: "Animation is gone after converting an animated GIF or WebP",
          paragraphs: [
            "Expected. `createImageBitmap` decodes only the first frame; this tool produces still images only. For animated output, use a dedicated tool — `ffmpeg`, `gifski`, or `@jsquash/webp` with multi-frame support.",
          ],
        },
        {
          heading: "Colours look different in the output (less saturated, shifted hue)",
          paragraphs: [
            "Your source image has an embedded ICC color profile (Display P3, Adobe RGB, ProPhoto RGB). Canvas re-encoding outputs sRGB unconditionally; wide-gamut colours are clipped to sRGB's narrower range.",
            "For colour-critical photography workflows, this tool is the wrong choice. Use `sharp` (Node.js), ImageMagick, or a desktop editor with explicit profile handling.",
          ],
        },
        {
          heading: "Best-practice checklist before converting",
          paragraphs: [
            "Six habits that prevent almost every conversion accident.",
          ],
        },
      ],
      bullets: [
        "Use PNG for screenshots, logos, and anything with text or sharp edges.",
        "Use JPEG quality 85 as the default for web-delivered photographs.",
        "Use WebP for new web delivery whenever possible — smaller than JPEG at equivalent quality, with optional transparency.",
        "Never convert JPEG → PNG expecting size savings; you only get size growth.",
        "Remember that transparency is lost when targeting JPEG.",
        "For animated sources or wide-gamut photography, use a dedicated tool — this converter is intentionally still-image, sRGB only.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · Canvas 重编码",
  title:
    "2026 年的 PNG、JPEG、WebP：选对编码器，让浏览器替你做完所有事",
  lead:
    "每一个现代浏览器都在 `canvas.toBlob()` 背后藏着一份硬件加速的 PNG、JPEG、WebP 编码器。所以一份正确的格式转换器就是四步流水线 —— 解码源、画上 Canvas、按目标格式重新编码、把 Blob 交给用户。难点不在数学，而在于知道哪种格式适合你手头的内容、质量滑块到底在调什么、以及这条流水线在哪些场景下会悄悄断（动图 GIF、超大图、色彩配置丢失）。本页就是这款工具背后的契约：我们到底在转什么、怎么转、以及哪些格式我们刻意不输出。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "图片格式选择是那种「答案完全取决于图片内容」的领域。W3C、IETF 和主流浏览器引擎已经在三种主力格式 —— PNG、JPEG、WebP —— 上达成共识，它们合起来基本覆盖了所有 Web 用例。理解一遍规则之后，每次选择都是 5 秒钟的事。",
      subsections: [
        {
          heading: "PNG —— 像素精确的截图、线稿、透明度",
          paragraphs: [
            "PNG 在 2003 年由 W3C/ISO 标准化（ISO/IEC 15948），作为 GIF 的无专利替代品。它是无损的：进去什么像素，出来还是什么像素。编码器先做一遍滤波器预测（每个像素根据邻居预测），再用 DEFLATE 压缩残差。这对「大片纯色区域 + 锐利边缘」的内容效果极好 —— 截图、UI 稿、Logo、线稿、所有把文字光栅化到图里的内容。但对照片就效果很差 —— 每个像素都跟邻居不同，DEFLATE 没什么可压。",
            "PNG 还支持 8 位 alpha 通道做透明。这对「需要叠在任意背景上」的 Logo、图标、以及任何会被后续合成的图都是必备项。如果你的源有透明像素、却转成了 JPEG，那些像素会变成不透明白色（或者 canvas 背景色），透明度一旦丢失就找不回来。",
            "PNG 适用于：图里有文字、图里有透明、图是截图、或者图后续还要编辑。不要用 PNG 存照片 —— 一张 4 MB 的风景 PNG 可以压到 ~400 KB 的高质量 JPEG，肉眼几乎看不出差别。",
          ],
        },
        {
          heading: "JPEG —— 照片、渐变、所有连续色调内容",
          paragraphs: [
            "JPEG（ISO/IEC 10918-1，1992）是过去三十年每一台相机、每一条照片流水线都在用的格式。它是有损的：编码器把图切成 8×8 块，做离散余弦变换，量化系数（有损步），再做 Huffman 编码。质量设置直接控制量化表 —— 质量 85 保留绝大多数系数；质量 50 把绝大多数系数都扔了。",
            "JPEG 在「平滑渐变、自然变化」的内容上非常出色 —— 照片、油画、任何相邻像素信息高度相关的图。但在「锐利边缘 + 文字」的内容上很糟糕 —— 8×8 的块结构会变成可见的「振铃」伪影，围绕高对比区域。如果你见过截图转 JPEG 后字母周围有光晕，那就是 JPEG 被用在了错的内容类型上。",
            "JPEG 不支持透明度，也没有动画支持，默认不嵌入颜色配置（虽然大多数编码器会带一个 sRGB 的 ICC 标记）。Web 投放照片的行业默认值是 JPEG 质量 85 —— 文件大小大约是同等 PNG 的 1/10，肉眼几乎察觉不到质量损失。",
          ],
        },
        {
          heading: "WebP —— 更新的默认，有损或无损，带透明度",
          paragraphs: [
            "WebP（Google，2010；RFC 9649，2024）是新 Web 投放应该选的默认格式。它支持有损编码（基于 VP8 帧内编解码）和无损编码（自定义字典压缩），两种模式都支持完整 alpha 透明。有损模式比同质量 JPEG 小约 25–35%；无损模式比 PNG 小约 26%。",
            "浏览器支持在 2020 年达到事实通用（Safari 14 是最后一个补齐的）。到 2026 年，向浏览器投放图片的默认值就该是 WebP，除非你有具体理由用别的（把文件交给非 Web 消费者、归档兼容、下游工具不解析 WebP）。",
            "WebP 的质量设置跟 JPEG 不一一对应。WebP 质量 75 大约相当于 JPEG 质量 90 —— WebP 编码器更高效，达到同样的感知质量需要的比特更少。如果你是为了减小体积把 JPEG 转 WebP，从 WebP 质量 80 起步再调整。",
          ],
        },
        {
          heading: "为什么本工具没有 AVIF",
          paragraphs: [
            "AVIF（AV1 Image File Format）是下一代格式，同质量下比 WebP 再小约 50%。所有主流浏览器都支持解码。问题在编码：`canvas.toBlob('image/avif', ...)` 到 2026 年仍未普遍实现 —— Chrome 和 Edge 能编码，Safari 和 Firefox 不能。在本工具里加 AVIF 选项的话，部分用户能用、部分用户会静默退化到 PNG。",
            "如果你确实需要 AVIF，请用专用编码器（`squoosh.app`、命令行的 `sharp`、或者 Web Worker 里跑 `@jsquash/avif`）。等到 `canvas.toBlob()` 在所有引擎上都支持 AVIF，我们会在这里加上。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "我们的转换器就是「两个平台原语 + 一个函数」：`createImageBitmap` 和 `canvas.toBlob`。真正有意思的工程在于处理边界情况 —— 颜色配置保留、超大图的内存管理、识别「这条流水线对这种输入结构上就错了」。",
      subsections: [
        {
          heading: "决策 1 · `createImageBitmap` 在主线程外解码",
          paragraphs: [
            "我们当然可以用 `new Image()` 配合 `img.src` 设个 data URL、再把 `img` 画到 canvas 上。这样能跑，但解码在主线程同步发生，大文件会卡 UI。`createImageBitmap(file)` 在线程外异步解码，返回一个 GPU 友好的 `ImageBitmap`，无论源大小如何画到 canvas 都是常数时间。",
            "bitmap 持有一份 GPU 资源（或常驻内存的解码像素缓冲）。我们在画完之后的 `finally` 里调 `bitmap.close()`，立即释放资源、不等下一次 GC。如果是会循环处理多个文件的转换器，忘了这一步会让内存膨胀几百 MB。",
          ],
        },
        {
          heading: "决策 2 · `canvas.toBlob` 就是编码器",
          paragraphs: [
            "bitmap 画到 canvas 上之后，`canvas.toBlob(callback, mimeType, quality)` 调用浏览器原生编码器处理所请求的 MIME。PNG 忽略 quality 参数（无损）；JPEG 和 WebP 把 quality 映射到编码器特定参数（JPEG 量化表、WebP 速率失真目标）。",
            "回调是异步的 —— 编码一张大图可能要几十毫秒。我们用 Promise 包一层，让调用方可以 `await`。如果编码失败（很大画布超出引擎每像素限制时会发生），回调收到 `null`，我们用 `Error('Failed to encode image')` reject。",
          ],
        },
        {
          heading: "决策 3 · 质量语义在不同格式之间不一致",
          paragraphs: [
            "我们的滑块把 0–1 的数字传给 `canvas.toBlob`。对 PNG，这个数字被静默丢弃。对 JPEG，它直接映射到标准 JPEG 质量（0 = 最大压缩/最低质量，1 = 最小压缩/最高质量）。对 WebP，各浏览器对规范的实现稍有不同 —— Chrome 用 libwebp 的 `WebPConfig.quality`，Firefox 走内部映射，Safari 用自家编码器。在质量 0.85 的视觉结果上各引擎接近到用户察觉不到，但字节数能差 10–20%。",
            "实操建议：JPEG 质量 0.85 对照片几乎是「视觉无损」。WebP 质量 0.75 在感知质量上大致相当，文件却更小。超过 0.95 收益锐减 —— 文件迅速变大、肉眼看不到改善。低于 0.60 时，平坦区域和边缘附近的压缩伪影会变得明显。",
          ],
        },
        {
          heading: "决策 4 · 颜色配置与 sRGB 默认前提",
          paragraphs: [
            "Canvas 重编码**不**保留源图的 ICC 颜色配置。解码器把源读到浏览器内部色域（出于兼容性基本等同于 sRGB），编码器把输出按 sRGB 打标。如果你的源是宽色域 Display P3 照片，转换后的文件会被标成 sRGB，宽色域被裁掉。",
            "对 99% 的 Web 用例这没问题 —— 每个浏览器、每台消费设备、每个社交平台默认就是 sRGB。但对需要保留 P3 或 Adobe RGB 的摄影流水线，本工具就是错的选择；请用命令行 `sharp` 或 ImageMagick 加显式 `--icc` 参数。",
          ],
        },
        {
          heading: "决策 5 · 动图 GIF 和动图 WebP 会丢失动画",
          paragraphs: [
            "`createImageBitmap` 只解码源的第一帧。如果你把动图 GIF 或动图 WebP 喂进本转换器，输出就是一张静态帧 —— 动画被静默丢掉。没有警告，因为平台不暴露「这个源还有更多帧」的检测能力，除非手工解析文件格式。",
            "如果你要把动图转成另一个动图格式，本工具不合适。请用 `ffmpeg`、`gifski`、或带多帧支持的专用 WebP 编码器。",
          ],
        },
        {
          heading: "决策 6 · 10 MB 体积上限",
          paragraphs: [
            "UI 上限制 10 MB 上传。技术原因：一张 50 MB 图片 `createImageBitmap` 大约要分配 50 MB GPU 端、再加上解码像素缓冲（宽 × 高 × 4 字节），一张 2400 万像素照片轻易就 200+ MB。在内存受限设备（手机、入门笔记本）上，这会触发浏览器的 OOM 处理器、把标签页崩溃掉。",
            "10 MB 对任何要发到 Web 上的图都足够宽松。如果你要转一份 50 MB 的相机 RAW 或 30 MB 扫描 TIFF，那已经超出本工具设计目标了 —— 请用桌面端转换器。",
          ],
        },
        {
          heading: "决策 7 · 浏览器标签页就是整个信任边界",
          paragraphs: [
            "所有逻辑都在加载本页的引擎实例里跑。图片永远不离开标签页。没有 Service Worker 记录文件内容、没有 `fetch` 往后端打、没有 `localStorage` 写入。文件的字节活在 `FileReader` 和 `ImageBitmap` 内存里，重置或关掉标签页就被 GC。",
            "这条性质重要的原因是：图片经常带着你没打算分享的元数据 —— EXIF 里的 GPS 坐标、相机序列号、拍摄时间戳。Canvas 重编码会**天然**剥掉所有 EXIF 元数据，因为图片是被光栅化过 GPU、再从原始像素数据重新发出来的。隐私靠架构保证，不靠承诺。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "几乎所有转换问题都能追溯到四类根因之一：内容类型选错了格式、动画丢了、颜色配置不匹配、输入太大。每一类被识别之后都能在几秒钟内修好。",
      subsections: [
        {
          heading: "输出的 JPEG 在文字或锐利边缘周围有难看的光晕",
          paragraphs: [
            "你把「锐利边缘内容」（截图、线稿、Logo）转成了 JPEG。JPEG 里的 8×8 块 DCT 没法高效表达锐利过渡，所以会把边缘的能量扩散到周围像素，变成可见的振铃伪影。",
            "改用 PNG 或无损 WebP。JPEG 是给照片用的；用在 UI 截图上无论质量多高输出都明显更差。",
          ],
        },
        {
          heading: "转换后的文件比原图还大",
          paragraphs: [
            "两种常见原因。第一，你把 JPEG 转成了 PNG：JPEG 本来就是有损压缩，把解码后的像素再用 PNG 编码，结果文件就大很多。永远要有意识地从「有损→无损」转，不要意外触发。",
            "第二，你把照片转成了无损 WebP 或 PNG。无损格式在自然色调内容上压不过有损格式；体积膨胀 10–20 倍是预期。照片请用有损 WebP 或 JPEG。",
          ],
        },
        {
          heading: "输出里透明区域变成了白色（或黑色）",
          paragraphs: [
            "JPEG 不支持透明度。当你把透明 PNG 或 WebP 转成 JPEG，canvas 的背景色（默认白色）会填充透明区域，alpha 通道被丢弃。",
            "如果你需要保留透明度，目标选 PNG 或 WebP。WebP 在有损和无损两种模式下都支持 alpha，所以「需要小文件 + 透明度」的 Web 图选 WebP。",
          ],
        },
        {
          heading: "转换动图 GIF 或 WebP 之后动画没了",
          paragraphs: [
            "符合预期。`createImageBitmap` 只解码第一帧；本工具只输出静态图。要动图输出，请用专用工具 —— `ffmpeg`、`gifski` 或带多帧支持的 `@jsquash/webp`。",
          ],
        },
        {
          heading: "输出的颜色看起来不对（饱和度降低、色相偏移）",
          paragraphs: [
            "你的源图嵌入了 ICC 颜色配置（Display P3、Adobe RGB、ProPhoto RGB）。Canvas 重编码无条件输出 sRGB；宽色域颜色被裁到 sRGB 的窄范围。",
            "对色彩关键的摄影流水线，本工具不合适。请用 Node.js 的 `sharp`、ImageMagick 或带显式配置处理的桌面编辑器。",
          ],
        },
        {
          heading: "开始转换前的最佳实践清单",
          paragraphs: [
            "下面这六条习惯能消灭几乎所有转换事故。",
          ],
        },
      ],
      bullets: [
        "截图、Logo、含文字或锐利边缘的内容 —— 用 PNG。",
        "Web 投放照片的默认 —— JPEG 质量 85。",
        "新 Web 投放尽量用 WebP —— 同质量下比 JPEG 小，还可选透明度。",
        "不要指望 JPEG → PNG 能省体积，只会变更大。",
        "记住目标选 JPEG 时透明度会丢失。",
        "动图或宽色域摄影场景，请用专用工具 —— 本转换器有意限定为静态图、sRGB。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
