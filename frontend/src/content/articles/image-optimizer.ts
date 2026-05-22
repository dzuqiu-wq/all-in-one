import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CANVAS PIXEL PIPELINE",
  title: "From PNG to WebP without a single byte leaving your browser",
  lead:
    "Image optimisation used to mean uploading photos to a cloud service that re-encoded them on remote CPUs. The browser has since caught up: Canvas APIs, native WebP encoding, and Web Workers make a fully client-side optimiser not just feasible but faster than most server pipelines. This page is the engineering story of how our Image Optimizer does the work without ever holding your file.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Image formats are not interchangeable. Each was designed for a specific audience and trade-off, and getting them confused is the single most common cause of bloated websites, slow mobile experiences, and over-large email attachments.",
      subsections: [
        {
          heading: "JPEG, PNG, WebP, AVIF — when to pick which",
          paragraphs: [
            "JPEG (ISO/IEC 10918) is the workhorse for photographic content. It uses discrete cosine transform compression that excels at smooth gradients (skin tones, sky) but quantises sharp edges into ringing artifacts. JPEG does not support transparency and re-saving a JPEG re-quantises it — so each generation of save loses quality.",
            "PNG (ISO/IEC 15948) uses lossless DEFLATE compression. It is the right choice for screenshots, logos, line art, and any image with crisp edges that must stay crisp. PNG supports an 8-bit alpha channel and is the safe answer when transparency matters. The cost is file size — a 1920×1080 PNG of an everyday photo can easily exceed 3 MB.",
            "WebP, released by Google in 2010 and finalised in 2018, was designed as the best of both worlds: lossy compression that beats JPEG by 25-35% at the same visual quality, plus optional lossless mode, plus alpha transparency, plus animation. WebP is supported in every major browser since Safari 14 (2020). For a website builder shipping new content today, WebP should be the default.",
            "AVIF (AV1 Image File Format) is the new contender. It offers another 20-30% file-size win over WebP at comparable quality. Browser support is excellent in Chrome and Firefox but still maturing in Safari. We do not yet ship AVIF output because encoder maturity in the browser remains uneven; the moment Safari's encoder reaches feature parity we will add it.",
          ],
        },
        {
          heading: "EXIF metadata and the privacy story",
          paragraphs: [
            "Every JPEG that comes out of a digital camera or smartphone carries EXIF metadata: the camera make and model, the lens, the exact GPS coordinates of capture, the exposure settings, the date and time. Some platforms strip this on upload; many do not. The result is that photos posted to forums, dating profiles, used cars listings, and real-estate websites routinely leak the photographer's home address in their EXIF.",
            "We strip EXIF automatically. Canvas-based re-encoding inherently drops metadata because the image is rasterised through the GPU and re-emitted from raw pixel data. There is no metadata to carry across. This is the strongest form of privacy: not 'we promise to strip metadata' but 'the architecture cannot preserve it'.",
          ],
        },
        {
          heading: "Why client-side optimisation is now the right answer",
          paragraphs: [
            "Five years ago the case for cloud image services was strong: phones lacked the CPU for fast JPEG re-encoding, browsers did not expose WebP encoders, and Web Workers were limited. None of that is true now. A 2018-era smartphone re-encodes a 12-megapixel photo to WebP in under two seconds, on battery, without uploading. The cloud round-trip is the slow path.",
            "The privacy story compounds the speed story. A user who optimises an image inside their browser produces a deterministic, EXIF-free, watermark-free output. A user who optimises via a cloud service produces all of the above plus a copy of the original sitting on someone else's S3 bucket. The asymmetry is enormous.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "The optimiser pipeline is built from four browser primitives: the File API for reading uploads, a hidden HTMLImageElement for decoding, an OffscreenCanvas for re-rendering, and `canvas.toBlob` for re-encoding. A Web Worker orchestrates the lot to keep the main thread responsive.",
      subsections: [
        {
          heading: "Stage 1 — decoding via HTMLImageElement",
          paragraphs: [
            "Reading the dropped file into a `Blob` is the easy part. Decoding the encoded bitstream into pixels is what the browser is genuinely good at. We construct a hidden `<img>` element, set `img.src = URL.createObjectURL(file)`, and wait for the `load` event. Behind the scenes, the browser dispatches to its native JPEG/PNG/WebP decoder — code that has been hardened over a decade of fuzz testing and security audits.",
            "Critically, we never write the decoded pixels to disk. They live in GPU-backed image memory until we explicitly draw them onto a canvas; if you close the tab mid-process, the kernel reclaims them in milliseconds.",
          ],
        },
        {
          heading: "Stage 2 — rasterising onto OffscreenCanvas",
          paragraphs: [
            "An OffscreenCanvas of the target dimensions is created. We compute the target size by applying any user-requested max-edge constraint (e.g., resize to 1920 px on the long side for web use) while preserving the source aspect ratio. The image is then drawn onto the canvas with `drawImage(img, 0, 0, targetWidth, targetHeight)`.",
            "Two image-smoothing knobs are exposed: `ctx.imageSmoothingEnabled` and `ctx.imageSmoothingQuality`. For photographic content we set them to true / 'high' which engages a Lanczos-like resampling. For pixel art or screenshots, the user can switch to nearest-neighbour to preserve crispness.",
          ],
        },
        {
          heading: "Stage 3 — re-encoding via canvas.toBlob",
          paragraphs: [
            "The Canvas is encoded back to a compressed Blob using `canvas.toBlob(callback, mimeType, quality)`. The browser's native encoder runs off the main thread, returning a Blob containing fresh JPEG, PNG, or WebP bytes. Quality is the single user-facing knob; internally it maps to the encoder's quantisation tables (for JPEG) or compression strength (for WebP).",
            "Because the Canvas already strips metadata, the Blob is a clean output. We then compute a SHA-256 of the result purely for the diagnostic UI — the hash is never transmitted anywhere; it exists so you can verify two compressions of the same source produce identical bytes (a check we use during regression testing).",
          ],
        },
        {
          heading: "Stage 4 — Web Worker orchestration",
          paragraphs: [
            "For batches of more than one image, we offload the entire pipeline into a Web Worker. The worker accepts a queue of File objects via `postMessage`, processes them sequentially, and posts each result back as a transferable Blob. Transferable objects (via the `transfer` parameter) move ownership of the underlying ArrayBuffer rather than copying it — which is what keeps memory usage flat even when batch-processing dozens of images.",
            "The orchestration also gives us a clean cancellation story: clicking 'Reset' posts a `{ type: 'cancel' }` message to the worker, which discards its queue and returns to idle. No straggling encodes pollute later batches.",
          ],
        },
        {
          heading: "Why we use `browser-image-compression` rather than building from scratch",
          paragraphs: [
            "All of the above could be re-implemented in a few hundred lines of code. We did not — the `browser-image-compression` library bundles roughly the same architecture plus extensive cross-browser regression tests for edge cases (Safari's quirks with `OffscreenCanvas`, Firefox's behaviour with non-multiple-of-2 dimensions in WebP). Buying that work for 12 KB gzipped is a fair trade.",
            "We do wrap the library in our own UI and add specific behaviours: deterministic file naming, optional Web Worker disable for mobile devices where Worker cost-of-startup outweighs the parallelism win, and the EXIF assertion that the library does not make explicit. Verifying assumptions across browser versions is the unglamorous work that makes this kind of tool reliable.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Image optimisation failures are usually one of three shapes: the output looks worse than the input at high quality settings, the file is unexpectedly larger after optimisation, or a browser-specific quirk produces a malformed result. The fixes below cover the common cases.",
      subsections: [
        {
          heading: "Why is my WebP larger than my PNG?",
          paragraphs: [
            "WebP wins decisively for photographic content but loses for tiny images with strong palettes — a 64×64 icon with only eight colours may encode smaller as a palettised PNG than as a WebP. The reason is fixed overhead: every WebP file has a small but non-trivial header (RIFF wrapper + VP8 frame metadata) that exceeds the entire encoded payload for very small images.",
            "Heuristic: below roughly 32×32 pixels or 1 KB output, stay on PNG. Above that, WebP wins on almost everything.",
          ],
        },
        {
          heading: "Why does the optimised image look worse than the source?",
          paragraphs: [
            "Most often the quality slider is set too low. 80% is the sweet spot for everyday photography; below 70% you start to see compression artefacts in smooth gradient areas; above 95% the file-size win disappears.",
            "A subtler cause is double-compression: if your source was already a JPEG saved at quality 60%, re-encoding to WebP at quality 80% will preserve roughly the source quality but with WebP's compression characteristics layered on top. The result can look softer than expected because the JPEG artifacts are now JPEG-flavoured even in WebP. Optimising the original RAW or PNG always gives a cleaner result.",
          ],
        },
        {
          heading: "My iPhone HEIC photos do not optimise correctly",
          paragraphs: [
            "Modern iPhones save photos as HEIC (High-Efficiency Image Container), a format Safari can decode but most other browsers and many older Safari versions cannot. Our optimiser runs in whatever browser the user opens — if your browser cannot decode HEIC, we cannot optimise it.",
            "The workaround is to export the photo from the iPhone Photos app as JPEG: in the iOS share sheet, choose 'Options' at the top, switch 'Most Compatible' under Formats, and re-share. The exported file will be a standard JPEG that any browser handles natively.",
          ],
        },
        {
          heading: "Batch optimisation seems to skip some files",
          paragraphs: [
            "Some browsers throttle Web Worker activity on inactive tabs as a battery-life optimisation. If you start a batch, switch to another tab, and come back, you may see fewer completed items than expected. Resume by keeping the optimiser tab focused, or use the per-file optimisation flow which is not subject to the same throttling.",
            "If a particular file consistently fails, it is almost certainly malformed. Open it in a system photo viewer; if that also rejects it, the file itself is the problem, not the optimiser.",
          ],
        },
        {
          heading: "Best-practice tips",
          paragraphs: [
            "These conventions keep image workflows predictable across designers, photographers, and developers:",
          ],
        },
      ],
      bullets: [
        "Use WebP for the web by default, JPEG for printed deliverables, PNG only when transparency matters.",
        "Quality 80% is the right baseline; deviate only when you have a measurable reason.",
        "Resize the long edge to 1920 px or 2560 px before compression — most CMSs cannot serve images above that resolution anyway.",
        "Keep the master photo in a lossless format (PNG or RAW); optimise per delivery channel rather than overwriting the source.",
        "If a file feels suspiciously large after optimisation, check whether your source was already heavily compressed — double-encoding rarely wins.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · Canvas 像素流水线",
  title: "PNG 到 WebP，整条压缩链路里没有一个字节离开过浏览器",
  lead:
    "图片优化过去意味着把照片上传到云服务、由远端 CPU 重新编码。如今浏览器已经追上：Canvas API、原生 WebP 编码、Web Workers，让一条完全运行在客户端的优化管线不仅可行，而且比多数服务端管线更快。本页是 All-in-One Toolbox 图片优化器的全部工程细节。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "图像格式不可互换。每一种都是为特定受众与特定取舍设计的，把它们用错，是网页臃肿、移动端缓慢、邮件附件超限的头号原因。",
      subsections: [
        {
          heading: "JPEG / PNG / WebP / AVIF：什么时候选谁",
          paragraphs: [
            "JPEG（ISO/IEC 10918）是摄影类内容的主力。它用离散余弦变换压缩，对平滑渐变（皮肤、天空）表现极佳，但会把锐利边缘量化成「振铃」伪影。JPEG 不支持透明，每次重新保存都会再量化一次——多代保存下来质量持续下降。",
            "PNG（ISO/IEC 15948）使用无损 DEFLATE。它适合截图、Logo、线稿，以及任何「边缘必须保持锐利」的图像。PNG 支持 8 位 alpha 透明通道，是「需要透明」场景里的稳妥答案。代价是体积——一张 1920×1080 的日常照片以 PNG 保存常常超过 3 MB。",
            "WebP 由 Google 在 2010 年发布、2018 年定型，目标是「兼顾两者优点」：在同等视觉质量下比 JPEG 体积小 25-35%、可选无损模式、支持 Alpha 透明、支持动画。WebP 自 Safari 14（2020 年）起被所有主流浏览器支持。今天新建网站，WebP 应该是默认选项。",
            "AVIF（AV1 Image File Format）是新挑战者，在同等质量下比 WebP 再小 20-30%。Chrome 与 Firefox 支持优秀，Safari 仍在追赶。我们目前没有上线 AVIF 输出，因为浏览器内的编码器成熟度尚不均匀——Safari 这边一旦补齐，我们就会加上。",
          ],
        },
        {
          heading: "EXIF 元数据与隐私故事",
          paragraphs: [
            "任何从数码相机或智能手机出来的 JPEG 都带 EXIF 元数据：相机品牌型号、镜头、拍摄时的精确 GPS 坐标、曝光参数、日期时间。有些平台在上传时帮你剥离，多数不剥离。结果就是：发到论坛、约会主页、二手车与房屋平台上的照片，常常在 EXIF 里直接泄漏摄影者家庭地址。",
            "我们自动剥离 EXIF。基于 Canvas 的重编码本质上就会丢掉元数据——因为图像经过 GPU 光栅化后从原始像素重新生成，根本不存在可以延续的元数据。这是最强的隐私保证：不是「我们承诺剥离」，而是「架构上保留不了」。",
          ],
        },
        {
          heading: "为什么「客户端优化」如今是正确答案",
          paragraphs: [
            "五年前云端图像服务的理由很充分：手机 CPU 不够强、浏览器没开放 WebP 编码器、Web Workers 也很受限。今天这些理由都不再成立。一台 2018 年的智能手机可以在不上传的情况下，靠电池供电，把一张 12 兆像素照片在 2 秒内重编码为 WebP。云端往返反而是慢的那条路。",
            "隐私优势叠加在速度优势之上。用户在浏览器内优化图片，结果是确定的、无 EXIF、无水印的输出。用户走云端，则是同样的输出加上「在某家公司 S3 里多一份原图」。这种不对称的体量极大。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "优化器管线建立在四个浏览器原语之上：File API 读取上传、隐藏的 HTMLImageElement 完成解码、OffscreenCanvas 重新光栅化、`canvas.toBlob` 重新编码。一切由 Web Worker 编排，主线程保持响应。",
      subsections: [
        {
          heading: "阶段 1 · HTMLImageElement 解码",
          paragraphs: [
            "把拖入的文件读成 `Blob` 是简单的；把编码字节流解码成像素，是浏览器真正擅长的部分。我们创建一个隐藏 `<img>`，把 `img.src` 设为 `URL.createObjectURL(file)`，等待 `load` 事件。背后浏览器调用原生 JPEG/PNG/WebP 解码器——这套代码经过十年的 fuzz 测试与安全审计。",
            "关键是我们从不把解码后的像素写到磁盘。它们一直停留在 GPU 支撑的图像内存里，直到我们显式 drawImage 到 canvas 上；用户中途关闭标签页，内核会在毫秒级回收。",
          ],
        },
        {
          heading: "阶段 2 · 在 OffscreenCanvas 上重新光栅化",
          paragraphs: [
            "我们创建一块目标尺寸的 OffscreenCanvas。目标尺寸的算法是：在保持源宽高比的前提下，应用用户请求的任何最大边约束（例如「长边缩到 1920 px 用于网页」）。然后通过 `drawImage(img, 0, 0, targetW, targetH)` 把图绘上去。",
            "这里暴露两个图像平滑相关参数：`ctx.imageSmoothingEnabled` 与 `ctx.imageSmoothingQuality`。对摄影内容我们设为 true / 'high'，浏览器内部使用类 Lanczos 重采样。对像素艺术或截图，用户可以切到最近邻以保持锐利。",
          ],
        },
        {
          heading: "阶段 3 · canvas.toBlob 重新编码",
          paragraphs: [
            "Canvas 通过 `canvas.toBlob(callback, mimeType, quality)` 编码回压缩 Blob。浏览器原生编码器跑在主线程之外，回调时返回包含新 JPEG / PNG / WebP 字节的 Blob。质量参数是面向用户的唯一旋钮——内部映射到 JPEG 的量化表或 WebP 的压缩强度。",
            "因为 Canvas 已经天然剥离元数据，Blob 是干净的输出。我们顺手算一份 SHA-256 仅用于诊断 UI——这个哈希从不被传到任何地方，只是为了让你能验证「同源同参数压缩两次会产出完全一致的字节」（这条不变量是我们回归测试用的）。",
          ],
        },
        {
          heading: "阶段 4 · Web Worker 编排",
          paragraphs: [
            "当一次批处理超过 1 张图，我们把整条管线卸载到 Web Worker。Worker 通过 `postMessage` 接收 File 队列、顺序处理，并把每一份结果以 transferable Blob 形式 post 回主线程。Transferable（通过 `transfer` 参数）会移交底层 ArrayBuffer 的所有权而非拷贝——这是批量处理几十张图时内存仍然保持平稳的关键。",
            "这套编排也给我们提供了干净的取消语义：点「重置」就向 Worker 发 `{ type: 'cancel' }` 消息，Worker 丢弃自己的队列回到 idle，不会让残余的编码污染下一批。",
          ],
        },
        {
          heading: "我们为什么用 browser-image-compression 而不是自己造轮子",
          paragraphs: [
            "上面这套架构完全可以自己用几百行写出来。我们没有这么做——`browser-image-compression` 这个库打包了几乎同款架构，并配套了跨浏览器回归测试，覆盖各种边缘案例（Safari 的 OffscreenCanvas 怪癖、Firefox 对非 2 倍数 WebP 尺寸的行为）。用 gzip 后 12 KB 的代价换这些工作，是值得的交易。",
            "我们在它之上加了自己的 UI 与几条特定行为：确定性的命名、对移动端可关 Web Worker 的开关（Worker 启动开销有时大于并行收益）、以及库本身没有显式承诺的 EXIF 断言。跨浏览器版本验证假设这件事不光鲜，但它正是这种工具可靠的关键。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "图像优化的失败通常呈现三种形态：高质量设置下输出反而看起来更差、压缩后体积反而变大、某种浏览器特有怪癖导致的畸形结果。下面是覆盖率最高的几条与对应解法。",
      subsections: [
        {
          heading: "为什么我的 WebP 比 PNG 还大？",
          paragraphs: [
            "WebP 对摄影内容是压倒性胜利，但对「极小尺寸 + 调色板有限」的图反而会输——一张 64×64、只有 8 种颜色的图标，按调色板 PNG 编码可能比 WebP 还小。原因是固定开销：每个 WebP 都有一个不大但非平凡的 header（RIFF 包装 + VP8 帧元数据），在极小图像上会超过实际像素数据本身。",
            "经验法则：分辨率低于约 32×32 或输出小于 1 KB 时，留在 PNG；高于这一阈值时，WebP 几乎在所有场景都赢。",
          ],
        },
        {
          heading: "为什么优化后的图看起来比原图差？",
          paragraphs: [
            "最常见原因是质量滑块设得过低。80% 是日常摄影的甜点；低于 70% 你能看到平滑渐变区出现压缩瑕疵；高于 95% 体积优势消失。",
            "更微妙的原因是「二次压缩」：源图本身已经是 60% 质量的 JPEG，你再用 80% 质量重编码为 WebP，等于把 JPEG 的瑕疵叠加一层 WebP 的压缩。结果会比预期更软。一律对原始 RAW 或 PNG 做优化能拿到更干净的结果。",
          ],
        },
        {
          heading: "我 iPhone 拍的 HEIC 在这里优化失败",
          paragraphs: [
            "现代 iPhone 默认保存 HEIC（High-Efficiency Image Container）。Safari 能解，但多数其它浏览器、以及较老版本的 Safari 不能。我们的优化器跑在用户当前打开的那个浏览器里——它解不了 HEIC，我们就也优化不了。",
            "解法是从 iPhone 相册里以 JPEG 形式导出：iOS 分享菜单点顶部「选项」，把 Formats 从 HEIC 切到「兼容性最佳」，再分享。导出后的文件是标准 JPEG，任意浏览器都能直接处理。",
          ],
        },
        {
          heading: "批量优化时似乎跳过了几张？",
          paragraphs: [
            "部分浏览器在非活动 tab 上会限流 Web Worker 以节省电量。如果你启动了批处理、切到另一个 tab、再切回来，可能会看到完成数量比预期少。把优化器 tab 保持在前台，或使用「逐文件」模式（不受限流影响）就能解决。",
            "如果某张文件一直失败，几乎可以肯定它是畸形的。用系统图片预览打开它——如果系统也拒绝打开，问题在文件本身而不是优化器。",
          ],
        },
        {
          heading: "实用小技巧",
          paragraphs: [
            "下面这些约定能让图片工作流在设计师、摄影师、开发者之间保持一致：",
          ],
        },
      ],
      bullets: [
        "网页场景默认 WebP，打印输出 JPEG，只有需要透明时才用 PNG。",
        "质量 80% 是合理基线；偏离需有可测量的理由。",
        "压缩前先把长边缩到 1920 px 或 2560 px——多数 CMS 也没法服务比这更高分辨率。",
        "母版照片保持无损（PNG 或 RAW），针对每个分发渠道单独优化，不要覆盖源文件。",
        "如果优化后体积反而很大，先确认源是不是已经被重压缩过——二次编码很少占便宜。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
