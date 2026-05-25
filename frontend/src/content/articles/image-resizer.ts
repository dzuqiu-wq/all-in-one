import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CANVAS RESAMPLING",
  title:
    "Image resizing in 2026: aspect-ratio math, browser smoothing, and where downsampling silently breaks",
  lead:
    "Resizing an image looks trivial — pick a width, pick a height, the browser does the rest. The actual operation involves three quietly hostile sub-problems: deciding what aspect ratio to preserve, choosing a resampling algorithm whose visual output you can predict, and recognising when the source content type makes the entire workflow wrong (text screenshots blurred into mush, patterned fabrics covered in Moiré, transparent PNGs accidentally flattened to JPEG). This page is the contract: what we resize, how the Canvas API resamples it, and which workflows we deliberately do not pretend to support.",
  sections: [
    {
      id: "industry",
      heading: "When to resize, and why size-first beats quality-first",
      lead:
        "There is no universal correct size. The right pixel dimensions depend entirely on what is going to consume the output — a web page on a 2x display, a social platform with its own pre-render pipeline, an email client that compresses again on send. The decision is always: what is the target surface, and what does it require?",
      subsections: [
        {
          heading: "Web delivery — match rendered size × DPR",
          paragraphs: [
            "A 1200×800 hero image rendered at 600×400 CSS pixels on a 2x display needs to be exactly 1200×800 in the file. Shipping a 4000×3000 source for a 600×400 slot wastes 90% of the bytes; shipping a 600×400 file forces the browser to upscale on retina screens and the result looks soft. The decision criterion is mechanical: take the largest CSS dimensions the image will ever render at, multiply by the maximum device pixel ratio you care to serve (almost always 2; 3 is excessive for photographic content), and resize to that.",
            "For responsive images, ship multiple sizes via `srcset` and let the browser pick. This tool generates one size at a time; chain it with `srcset` markup, or use a build-time tool (`sharp`, `next/image`) if you need automated multi-size output.",
          ],
        },
        {
          heading: "Social media — every platform has a different spec",
          paragraphs: [
            "Twitter/X expects 1600×900 for landscape OG cards. Facebook prefers 1200×630. Instagram square is 1080×1080, Stories is 1080×1920, Reels covers 1080×1920 too but with safe-zone padding. LinkedIn posts cap at 1200×627. WeChat Moments accepts 1080×1080 to 1080×1350.",
            "If you upload at the wrong aspect, the platform crops without warning and your design intent is destroyed. Resize before upload to the platform's exact spec. The platforms re-encode aggressively, so quality settings here matter less than dimensions — get the box right and let the platform compress.",
          ],
        },
        {
          heading: "Thumbnails — small enough that artefacts disappear",
          paragraphs: [
            "Thumbnails (32×32 to 256×256) are forgiving — at that size, most resampling artefacts vanish because the human eye cannot resolve the detail. Worry less about the resampling algorithm and more about consistent aspect ratio across the thumbnail set. Mixing 4:3 and 16:9 thumbs in the same grid looks worse than any individual quality issue.",
          ],
        },
        {
          heading: "Print — this is the wrong tool",
          paragraphs: [
            "Print workflows need CMYK conversion, ICC profile preservation, and dimensional accuracy in inches/millimetres at a target DPI (typically 300 for offset, 150 for desk inkjet). None of those are available through Canvas. If your output is going to a printer, use `sharp` with explicit profile flags, or a desktop editor like Photoshop/Affinity that owns the colour pipeline end-to-end.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · the Canvas resampling pipeline",
      lead:
        "Resizing in the browser is `createImageBitmap` plus `ctx.drawImage` with explicit destination dimensions. The interesting engineering is in (a) what `imageSmoothingQuality: 'high'` actually does, (b) how aspect-ratio math interacts with rounding, and (c) why successive small resizes are worse than one direct resize.",
      subsections: [
        {
          heading: "Step 1 — `createImageBitmap` decodes off-thread",
          paragraphs: [
            "The source `File` is decoded asynchronously into a GPU-friendly `ImageBitmap` by the browser. The decode does not touch the main thread, so large source files (up to our 10 MB limit) do not block UI animations.",
            "The bitmap holds a GPU resource. We call `bitmap.close()` in `finally` after the drawImage call so the resource is released immediately instead of waiting for GC. On a workflow that loops over many files, forgetting this leaks hundreds of megabytes.",
          ],
        },
        {
          heading: "Step 2 — `imageSmoothingQuality: 'high'` selects bicubic-class resampling",
          paragraphs: [
            "The Canvas spec defines `imageSmoothingQuality` as `'low' | 'medium' | 'high'`, with `'low'` being roughly bilinear and `'high'` being a bicubic or Lanczos-class filter. Each browser ships its own implementation: Chrome/Edge use a Lanczos-3 filter for downscale and bicubic for upscale; Firefox uses a Mitchell-Netravali filter; Safari uses bicubic throughout. The visible differences at typical web sizes (resize a 2000px photo to 800px) are imperceptible to non-experts, but they exist.",
            "We set `'high'` unconditionally. The cost is a few extra milliseconds per resize; the benefit is markedly sharper output than the default `'low'` setting, especially for photographic content with fine detail.",
          ],
        },
        {
          heading: "Step 3 — Aspect ratio math is multiplication, but rounding matters",
          paragraphs: [
            "When the user locks aspect ratio and types a new width, we compute the corresponding height as `round(newWidth * srcHeight / srcWidth)`. The `Math.round` matters: without it, a source that is exactly 1920×1080 resized to width 1280 would compute height 720.0, but a source that is 1921×1080 would compute 720.5625 — and the browser cannot draw to a fractional canvas. We round to the nearest integer, which introduces at most a 0.5-pixel error in either dimension. For images larger than 100px in the affected dimension, this is invisible.",
            "If your workflow needs sub-pixel-perfect aspect preservation (architectural rendering, design system asset generation), this tool's integer rounding will introduce a barely-detectable shear over many sequential operations. Resize once, from the canonical source, not in chains.",
          ],
        },
        {
          heading: "Step 4 — Why one big resize beats two small ones",
          paragraphs: [
            "Suppose you want to go from 4000×3000 to 800×600. You could resize to 2000×1500 first, then to 800×600 — but each pass runs the source through a low-pass resampling filter, and filters lose high-frequency detail. Two passes lose roughly the square of what one pass loses; three passes are visibly soft on text and patterned content.",
            "Always resize from the largest available source to the final target in one operation. Keep originals; resize copies; never chain.",
          ],
        },
        {
          heading: "Step 5 — Downsampling artefacts you should expect",
          paragraphs: [
            "Two artefacts dominate. Moiré: when a regular pattern in the source (textile weaves, screen pixels in a screenshot, brick walls in architecture) interacts with the resampling filter's spatial frequency, you get visible interference fringes — wavy bands that were not in the source. Mitigated only by pre-blurring the source slightly before resize, which this tool does not do.",
            "Edge softening: bicubic/Lanczos filters always introduce some softening because they integrate over a wider neighbourhood than a single pixel. On text, this is visible as anti-aliasing widening at small sizes. If your source contains rendered text that must stay sharp, do not resize it — re-render the text at the target size instead.",
          ],
        },
        {
          heading: "Step 6 — The 16384px ceiling",
          paragraphs: [
            "Browser Canvas has a per-engine maximum dimension, typically 16384×16384 pixels (Chrome, Firefox) or 4096×4096 (mobile Safari on older devices). We do not enforce a hard limit; the OS does. If you request a 20000×20000 output, the canvas constructor silently caps at the engine maximum and the result is wrong.",
            "For any realistic web workflow, you will not approach this limit. If you need a 30000-pixel-wide poster, this is the wrong tool — use `sharp` or ImageMagick with explicit memory tuning.",
          ],
        },
        {
          heading: "Step 7 — The browser tab is the entire trust boundary",
          paragraphs: [
            "Everything runs inside the engine instance that loaded this page. The image never leaves the tab. No Service Worker logs file contents, no `fetch` to a backend, no `localStorage` write. The bytes live in `FileReader` and `ImageBitmap` memory and are garbage-collected when you reset or close the tab.",
            "Canvas resampling also strips all EXIF metadata, because the image is rasterised through the GPU and re-emitted from raw pixel data. GPS coordinates, camera serial numbers, capture timestamps — all gone in the output file. Privacy by architecture, not by promise.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Almost every resize problem traces back to one of five root causes: wrong target size, aspect ratio not locked, source too small for the requested output, source format not suitable, or the workflow itself was wrong for the content type.",
      subsections: [
        {
          heading: "Output is blurry or soft after downsizing",
          paragraphs: [
            "Most common cause: the source was already downsized once, and you are now downsizing again. Each resize pass adds softening; chain two and the output looks underwater. Go back to the original source if you have it.",
            "Second cause: source had rendered text. Bicubic resampling always softens text edges. If the output must contain crisp text, re-render the text at the new size instead of resizing a rasterised version.",
          ],
        },
        {
          heading: "Image stretched or squashed (aspect ratio wrong)",
          paragraphs: [
            "You disabled aspect-ratio lock and typed dimensions that do not match the source. The Canvas draws the source into the target box with independent X and Y scaling — distortion is the inevitable result.",
            "Re-enable the aspect-ratio lock. If you genuinely need a non-aspect-preserving fit (rare), accept the distortion or crop the source first to match the target aspect.",
          ],
        },
        {
          heading: "Moiré patterns or interference fringes appeared",
          paragraphs: [
            "Source contains regular patterns at a spatial frequency that interacts badly with the resampling filter. Common offenders: textile weaves, screenshots containing other images, architectural photos with brickwork, halftone-printed scans.",
            "Mitigations outside this tool: pre-blur the source slightly with a Gaussian (`sharp -blur 1`), or resize to a size where the pattern frequency lines up with the output grid (often a 50% scale or 25% scale ratio).",
          ],
        },
        {
          heading: "Transparency became black or opaque",
          paragraphs: [
            "You resized a transparent PNG/WebP and the source MIME was JPEG, or you have JPEG source and expected transparency in output. JPEG does not support an alpha channel. The Canvas falls back to a black fill where the alpha would be. Resize to PNG or WebP if you need transparency.",
          ],
        },
        {
          heading: "Output dimensions do not match what I typed",
          paragraphs: [
            "You requested a dimension exceeding the browser Canvas ceiling (typically 16384px). The canvas is silently capped and the resize is computed against the smaller dimension. Use a smaller output, or switch to a desktop tool.",
          ],
        },
        {
          heading: "Best-practice checklist before resizing",
          paragraphs: [
            "Five habits that prevent almost every resize accident.",
          ],
        },
      ],
      bullets: [
        "Always resize from the largest available source in one pass — never chain.",
        "Keep aspect-ratio lock on by default; disable it only when you have a specific reason.",
        "Match the target dimensions to the final consumer (CSS size × DPR, platform spec).",
        "For text-heavy content, re-render at the new size rather than resampling a raster.",
        "Resize copies, not originals — keep the source file intact.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · Canvas 重采样",
  title:
    "2026 年的图片尺寸调整：纵横比数学、浏览器平滑、以及下采样在哪里悄悄翻车",
  lead:
    "调整图片尺寸看起来很简单 —— 选一个宽、选一个高，浏览器搞定剩下的。但真正的操作藏着三个不友好的子问题：要保留哪条纵横比、要用一个视觉结果可预测的重采样算法、以及识别「源内容类型让整条流水线一开始就错了」（文字截图被模糊成糊状、有纹理的布料覆盖一层 Moiré 干涉、透明 PNG 不小心被压扁成 JPEG）。本页就是这款工具背后的契约：我们到底在缩什么、Canvas API 是怎么重采样的、以及哪些工作流我们刻意不假装支持。",
  sections: [
    {
      id: "industry",
      heading: "什么时候需要调整尺寸 —— 「先定尺寸再定质量」",
      lead:
        "没有「普适正确」的尺寸。合适的像素值完全取决于谁要消费输出 —— 一个 2x 屏幕的网页、一个有自家重渲染流水线的社交平台、一个发送时还会再压缩一次的邮件客户端。决策永远是：目标载体是什么，它需要什么？",
      subsections: [
        {
          heading: "Web 投放 —— 按渲染尺寸 × DPR 给图",
          paragraphs: [
            "一张 1200×800 的英雄图在 2x 屏幕上以 600×400 CSS 像素渲染，文件里必须正好是 1200×800。把 4000×3000 的原图发到 600×400 的位置上，90% 的字节是浪费；发 600×400 又会让浏览器在视网膜屏上拉伸，结果发软。判断标准是机械的：取这张图在 UI 里最大会渲染到的 CSS 尺寸，乘以你最高要服务的设备像素比（基本是 2；3 对照片内容是浪费），按这个尺寸缩。",
            "响应式图请用 `srcset` 发多套尺寸让浏览器自选。本工具一次出一个尺寸；结合 `srcset` 标记使用，或者用构建期工具（`sharp`、`next/image`）做自动化多尺寸。",
          ],
        },
        {
          heading: "社交媒体 —— 每个平台规格都不一样",
          paragraphs: [
            "Twitter/X 的横向 OG 卡是 1600×900。Facebook 推荐 1200×630。Instagram 方图是 1080×1080，Stories 是 1080×1920，Reels 也是 1080×1920 但带安全区内边距。LinkedIn 帖上限 1200×627。微信朋友圈接受 1080×1080 到 1080×1350。",
            "上传错纵横比，平台会无声地裁切，你的设计意图就被毁了。上传前按平台精确规格调整尺寸。平台会做激进的二次编码，所以这里的「质量」设置远没有「尺寸」重要 —— 框架对了，剩下的让平台去压。",
          ],
        },
        {
          heading: "缩略图 —— 小到伪影自动消失",
          paragraphs: [
            "缩略图（32×32 到 256×256）很宽容 —— 在这种尺寸下，绝大多数重采样伪影都看不见，因为人眼分辨不出那种细节。重采样算法别担心，担心「缩略图集合里纵横比一致」就行。同一个网格里混 4:3 和 16:9 缩略图，看起来比任何单图的画质问题都难看。",
          ],
        },
        {
          heading: "印刷 —— 本工具不合适",
          paragraphs: [
            "印刷流水线需要 CMYK 转换、ICC 颜色配置保留、按英寸/毫米的物理尺寸 + 目标 DPI 精确（胶印 300 DPI、桌面喷墨 150 DPI）。Canvas 一项都给不了。如果输出要进印厂，请用带显式 profile 参数的 `sharp`，或者从头到尾掌控色彩流水线的桌面编辑器（Photoshop / Affinity）。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · Canvas 重采样流水线",
      lead:
        "浏览器里调尺寸 = `createImageBitmap` + 显式目标尺寸的 `ctx.drawImage`。真正有意思的工程在于 (a) `imageSmoothingQuality: 'high'` 到底做了什么，(b) 纵横比数学和取整怎么互相干扰，(c) 为什么「多次小缩」比「一次大缩」差。",
      subsections: [
        {
          heading: "决策 1 · `createImageBitmap` 线程外解码",
          paragraphs: [
            "源 `File` 被浏览器异步解码成 GPU 友好的 `ImageBitmap`。解码不碰主线程，所以大源文件（最多 10 MB 上限）不会卡 UI 动画。",
            "bitmap 持有一份 GPU 资源。我们在 drawImage 之后的 `finally` 里调 `bitmap.close()`，立即释放、不等 GC。如果是循环处理多个文件的工作流，忘了这步会泄漏几百 MB。",
          ],
        },
        {
          heading: "决策 2 · `imageSmoothingQuality: 'high'` 选 bicubic 量级的重采样",
          paragraphs: [
            "Canvas 规范定义 `imageSmoothingQuality` 为 `'low' | 'medium' | 'high'`，`'low'` 大致是双线性、`'high'` 大致是 bicubic 或 Lanczos 量级。每个浏览器自己实现：Chrome/Edge 下采样用 Lanczos-3、上采样用 bicubic；Firefox 用 Mitchell-Netravali；Safari 全程 bicubic。在典型 Web 尺寸（2000px 照片缩到 800px）下，非专家看不出区别，但区别确实存在。",
            "我们无条件设 `'high'`。代价是每次缩多几毫秒，收益是输出比默认 `'low'` 明显更锐利，对带细节的照片尤其明显。",
          ],
        },
        {
          heading: "决策 3 · 纵横比数学是乘法，但取整很关键",
          paragraphs: [
            "用户锁纵横比、键入新宽度时，我们按 `round(newWidth * srcHeight / srcWidth)` 算高。`Math.round` 很关键：没它的话，1920×1080 源缩到 width 1280 会算到 height 720.0，但 1921×1080 源会算到 720.5625 —— 浏览器画不出小数像素的 canvas。我们四舍五入到最近整数，两边维度最多引入 0.5 像素误差。对受影响维度超过 100px 的图，这看不见。",
            "如果你的工作流需要亚像素精度的纵横比保留（建筑渲染、设计系统资产生成），本工具的整数取整在多次串行操作之后会引入几乎不可察觉的剪切。从原始源缩一次，别串行。",
          ],
        },
        {
          heading: "决策 4 · 为什么「一次大缩」赢过「两次小缩」",
          paragraphs: [
            "假设你要从 4000×3000 缩到 800×600。可以先缩到 2000×1500、再缩到 800×600 —— 但每一遍都把源过一遍低通重采样滤波器，滤波器会损失高频细节。两遍损失大约是一遍损失的平方；三遍之后文字和纹理内容明显发软。",
            "永远从可获得的最大源一次性缩到目标。留原图、缩副本、不要串行。",
          ],
        },
        {
          heading: "决策 5 · 你应该预期的下采样伪影",
          paragraphs: [
            "两类伪影占绝大多数。Moiré：源里的规则图案（布料织纹、截图里的屏幕像素、建筑的砖墙）和重采样滤波器的空间频率干涉，会产生可见的干涉条纹 —— 源里没有的波浪带。只有在缩之前对源做轻微预模糊才能缓解，本工具不做这步。",
            "边缘软化：bicubic/Lanczos 滤波器总会引入一些软化，因为它们在比单像素更宽的邻域上积分。对文字，小尺寸下抗锯齿区会加宽。如果源里有需要保持锐利的渲染文字，请别缩 —— 在目标尺寸下重新渲染文字。",
          ],
        },
        {
          heading: "决策 6 · 16384px 的天花板",
          paragraphs: [
            "浏览器 Canvas 有每引擎单维上限，通常 16384×16384（Chrome、Firefox）或 4096×4096（旧设备上的移动 Safari）。我们不强硬限制；操作系统会。如果你要 20000×20000 的输出，canvas 构造器静默截到引擎上限，结果就错了。",
            "对任何现实 Web 工作流，远远碰不到这个限制。如果你要 30000 像素宽的海报，本工具不合适 —— 请用带显式内存调参的 `sharp` 或 ImageMagick。",
          ],
        },
        {
          heading: "决策 7 · 浏览器标签页就是整个信任边界",
          paragraphs: [
            "所有逻辑都在加载本页的引擎实例里跑。图片永远不离开标签页。没有 Service Worker 记录文件内容、没有 `fetch` 往后端打、没有 `localStorage` 写入。字节活在 `FileReader` 和 `ImageBitmap` 内存里，重置或关掉标签页就被 GC。",
            "Canvas 重采样也会**天然**剥掉所有 EXIF 元数据，因为图片是被光栅化过 GPU、再从原始像素数据重新发出来的。GPS 坐标、相机序列号、拍摄时间戳 —— 输出文件里都没了。隐私靠架构保证，不靠承诺。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "几乎所有调尺寸问题都能追溯到五类根因之一：目标尺寸不对、纵横比没锁、源对要求的输出来说太小、源格式不合适、或工作流对内容类型本身就错。",
      subsections: [
        {
          heading: "下采样之后输出模糊或发软",
          paragraphs: [
            "最常见原因：源本身已经被缩过一遍了，你现在又缩一次。每一遍都加软化；串两遍输出就像在水下。如果有原始源，从头重来。",
            "第二常见：源里有渲染文字。Bicubic 重采样总会软化文字边缘。如果输出必须含清晰文字，请在新尺寸下重新渲染文字，而不是缩光栅化的版本。",
          ],
        },
        {
          heading: "图片被拉伸或压扁（纵横比错了）",
          paragraphs: [
            "你关了纵横比锁、键入了和源不匹配的尺寸。Canvas 用独立 X、Y 缩放把源画进目标盒子，失真是必然结果。",
            "重新打开纵横比锁。如果你确实需要不保留纵横比的拉伸（很少见），接受失真，或者先把源裁到目标纵横比。",
          ],
        },
        {
          heading: "出现 Moiré 图案或干涉条纹",
          paragraphs: [
            "源里有规则图案，频率和重采样滤波器干涉。常见元凶：布料织纹、含其它图的截图、有砖墙的建筑摄影、网点印刷的扫描件。",
            "本工具之外的缓解：对源做轻微 Gaussian 预模糊（`sharp -blur 1`），或者缩到能和输出栅格频率对上的尺寸（通常是 50% 或 25% 比例）。",
          ],
        },
        {
          heading: "透明度变成了黑色或不透明",
          paragraphs: [
            "你缩了一张透明 PNG/WebP，但源 MIME 是 JPEG；或者源是 JPEG、却期望输出有透明度。JPEG 不支持 alpha 通道。Canvas 在本该是 alpha 的地方回退到黑色填充。要保留透明度请缩到 PNG 或 WebP。",
          ],
        },
        {
          heading: "输出的尺寸和我键入的不一样",
          paragraphs: [
            "你请求了超过浏览器 Canvas 上限（通常 16384px）的维度。canvas 被静默截短，缩放按较小的维度算。换个小一点的输出，或者切到桌面工具。",
          ],
        },
        {
          heading: "开始调尺寸前的最佳实践清单",
          paragraphs: [
            "下面这五条习惯能消灭几乎所有调尺寸事故。",
          ],
        },
      ],
      bullets: [
        "永远从可获得的最大源一次缩到位 —— 不要串行。",
        "默认让纵横比锁开着；只在有具体理由时再关。",
        "目标尺寸匹配最终消费方（CSS 尺寸 × DPR、平台规格）。",
        "对文字密集内容，在新尺寸下重新渲染，而不是重采样光栅版本。",
        "缩副本、不缩原图 —— 源文件保持完整。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
