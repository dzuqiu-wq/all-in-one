import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · BTOA / ATOB IN THE BROWSER",
  title:
    "Base64 in 2026: RFC 4648, the URL-safe variant, and why the browser already ships everything you need",
  lead:
    "Base64 is the duct tape of the web — the encoding you reach for whenever binary data has to ride through a transport designed for text. The grammar is fifty years old, the browser API is four characters long, and yet developers still trip on the same handful of edge cases: UTF-8 handling, URL safety, and the 33% size tax. This page is the contract under our tool: what we encode, how we encode it, and which mistakes we explicitly refuse to make.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Base64 is older than most of the protocols that use it. It predates the web, predates JSON, and predates the modern URL grammar. Understanding what the spec actually says — and which dialect a given consumer expects — is the difference between a payload that parses everywhere and one that mysteriously fails on a single endpoint.",
      subsections: [
        {
          heading: "RFC 4648 — the spec this tool enforces",
          paragraphs: [
            "Base64 was first published in 1987 as part of RFC 989 (Privacy-Enhanced Mail), then rolled into MIME by RFC 2045 in 1996, and finally consolidated as a standalone encoding in RFC 4648 in 2006. Section 4 defines the standard alphabet — A-Z, a-z, 0-9, plus `+` and `/`, with `=` as the padding character. Section 5 defines the URL-safe variant — same alphabet, but `+` becomes `-` and `/` becomes `_`, and padding is optional.",
            "Both variants encode three input octets into four output characters. A two-byte input produces four output characters with one `=` of padding; a one-byte input produces four output characters with two `=` of padding. The alphabet was chosen so every character is safe for 7-bit ASCII transport — no control codes, no quoting, no escape sequences. That is the entire reason Base64 exists: pre-1990s mail relays could not reliably deliver arbitrary bytes, so binary payloads were laundered through a 64-character alphabet that survived every transit hop.",
            "Our tool implements exactly RFC 4648 §4 (default) and §5 (URL-safe toggle). We do not implement Base32, Base58 (used by Bitcoin), or Base85 (used by Adobe PDF). Those are different encodings with different alphabets and different problem domains.",
          ],
        },
        {
          heading: "Where Base64 actually shows up in modern stacks",
          paragraphs: [
            "Four use-cases dominate production traffic. Each one has its own dialect quirks and its own failure mode when the wrong variant is chosen.",
            "First, data URLs. `data:image/png;base64,iVBORw0KG...` lets you inline a binary asset directly into HTML or CSS. The standard alphabet is required; browsers reject the URL-safe variant for `data:` URIs because the scheme predates RFC 4648 §5.",
            "Second, JSON Web Tokens. A JWT is three URL-safe Base64 segments separated by dots: header, payload, signature. The URL-safe variant is mandatory because JWTs travel in `Authorization` headers, URL fragments, and cookie values, where `+` and `/` would need escaping. Padding is also stripped.",
            "Third, HTTP Basic Authentication. `Authorization: Basic ` + standard Base64 of `username:password`. The standard alphabet is correct here because the value is inside a header, not a URL.",
            "Fourth, email attachments. MIME parts encoded as Base64 use the standard alphabet with line wrapping at 76 characters (RFC 2045). Our tool does not insert line wraps because modern consumers (JSON APIs, data URLs, JWTs) all reject embedded newlines — if you need RFC 2045 line wrapping for an SMTP relay, post-process the output with a 76-character chunker.",
          ],
        },
        {
          heading: "Why two variants exist — the URL-safe story",
          paragraphs: [
            "When RFC 4648 was drafted, the URL grammar (RFC 3986) had already reserved `+` as a space-equivalent in `application/x-www-form-urlencoded` bodies and `/` as a path separator. A standard Base64 string dropped into a query parameter would be mangled by every URL parser between the sender and the receiver: `+` might become a space, `/` might be treated as a path boundary, and `=` is permitted but ugly.",
            "The URL-safe variant solves this by substituting two characters: `+` → `-` and `/` → `_`. Both replacements are unreserved in RFC 3986, meaning no URL parser will touch them. Padding is also optional in the URL-safe variant — most consumers (including every major JWT library) strip the trailing `=` characters because the decoder can infer them from the input length.",
            "Choose URL-safe whenever the encoded value will appear in a URL, a filename, an HTTP header value that survives a redirect, or a JWT. Choose standard for everything else. When in doubt, standard is the safer default because more consumers accept it.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Our implementation is fifteen lines of TypeScript over the platform's `btoa` and `atob`, with a `TextEncoder`/`TextDecoder` bridge for UTF-8 and a four-character regex pair for URL-safe transcoding. The interesting engineering is in what we deliberately do NOT do.",
      subsections: [
        {
          heading: "Step 1 — Why `btoa` alone is not enough",
          paragraphs: [
            "`btoa(\"hello\")` returns `\"aGVsbG8=\"`. `btoa(\"你好\")` throws `InvalidCharacterError`. The reason is historical: `btoa` predates UTF-8 awareness in the platform. It expects a binary string where every character is in the 0-255 range — essentially a Latin-1 buffer. Any code point above 255 is rejected.",
            "The fix is the standard `TextEncoder` bridge. We first run the input through `new TextEncoder().encode(input)`, which produces a `Uint8Array` of UTF-8 bytes. We then map each byte to a Latin-1 character via `String.fromCharCode(b)` and feed that string to `btoa`. The reverse path uses `atob` to produce a Latin-1 string, copies each char code into a `Uint8Array`, and runs it through `new TextDecoder().decode(bytes)`.",
            "This is the canonical pattern. The MDN page for `btoa` documents it. Every modern Base64 library on npm implements the same dance. The only alternative is to call into a hand-rolled tokenizer, which is slower, larger, and more bug-prone than the four-line bridge.",
          ],
        },
        {
          heading: "Step 2 — `btoa` and `atob` are still SIMD-fast",
          paragraphs: [
            "It is tempting to assume the platform Base64 routines are slow because they predate JIT compilers. They are not. V8, JSC, and SpiderMonkey all implement `btoa` and `atob` as C++ intrinsics with SIMD acceleration on x86 and ARM. Throughput is on the order of gigabytes per second for both encoding and decoding.",
            "Reimplementing Base64 in user-space JavaScript would be a strict regression. The only legitimate reason to ship a JS implementation is to support streaming for inputs larger than browser string length limits — and at that point you should be using `FileReader` or `ReadableStream`, not a Base64 textarea.",
          ],
        },
        {
          heading: "Step 3 — URL-safe is just a regex pair",
          paragraphs: [
            "RFC 4648 §5 differs from §4 in exactly three characters. Encoding to URL-safe is `encodeBase64(input).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')`. Decoding reverses the substitutions and re-pads to a length divisible by four before calling the standard decoder.",
            "There is no separate parser. The whole transformation is six characters of input alphabet that get swapped at the string boundary, with padding fixed up on the decode side. That is the entire URL-safe variant. Libraries that ship a separate `base64url` codec module are paying for nothing.",
          ],
        },
        {
          heading: "Step 4 — Where errors actually come from",
          paragraphs: [
            "`atob` throws `InvalidCharacterError` when the input contains a character outside the standard alphabet, or when the length is not a multiple of four (after padding). It does NOT throw on inputs that decode to invalid UTF-8 — that failure surfaces from `TextDecoder.decode` instead, which can be configured to throw via `{ fatal: true }`.",
            "Our `decodeBase64` catches the `atob` throw, our UI surfaces a single localized error string, and we do not attempt to repair the input. Best-effort repair — auto-trimming whitespace, auto-padding, auto-substituting characters — sounds friendly but tends to hide real bugs upstream. If the producer is emitting malformed Base64, the right answer is to fix the producer, not to paper over it in the decoder.",
          ],
        },
        {
          heading: "Step 5 — The 33% size tax, in one sentence",
          paragraphs: [
            "Base64 emits one ASCII character per six input bits. Four output characters carry three input bytes, so the encoded size is exactly `ceil(input_bytes / 3) * 4` characters, which works out to roughly 133% of the input length once padding is included.",
            "That overhead is not a bug; it is the price of the 6-bit-per-character alphabet. If 33% is too much for your transport, you do not want Base64 — you want gzip (which compresses first, then potentially Base64s the compressed bytes) or a binary-safe protocol like `multipart/form-data` or `application/octet-stream`.",
          ],
        },
        {
          heading: "Step 6 — The browser tab as the entire sandbox",
          paragraphs: [
            "Everything runs inside the engine instance that loaded this page. There is no Service Worker, no Web Worker, no `fetch` to a backend, no `localStorage` write. The textarea content lives in component state and is dereferenced when the tab closes.",
            "That property has a security-relevant consequence: a Base64-encoded credential pasted here is invisible to our infrastructure. We do not have an endpoint that could log it; we do not even have a request handler that could intercept it. The blast radius of an information disclosure is exactly the radius of your own browser tab.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Almost every Base64 failure traces back to one of four root causes: wrong variant (standard vs URL-safe), missing padding, embedded whitespace, or a non-UTF-8 source. Each is fixable in seconds once recognised.",
      subsections: [
        {
          heading: "`InvalidCharacterError` — wrong variant or embedded characters",
          paragraphs: [
            "If you decode a JWT segment with the standard decoder, `atob` will throw the moment it hits a `-` or `_`. The fix is to switch the URL-safe toggle on in this tool, or use the dedicated URL-safe decoder in your code.",
            "Conversely, if a payload contains `+` or `/` and you have the URL-safe toggle on, the URL-safe decoder will reject those characters. Match the variant to the source.",
          ],
        },
        {
          heading: "`InvalidCharacterError` — embedded whitespace or newlines",
          paragraphs: [
            "Standard `atob` rejects whitespace inside the input. MIME Base64 (RFC 2045) wraps lines at 76 characters, so payloads copied from raw email source will contain `\\r\\n` boundaries that fail in modern browsers.",
            "Strip whitespace with `input.replace(/\\s+/g, '')` before decoding. Our tool does NOT auto-strip — the goal is to surface bad input rather than silently mutate it, but the fix is a one-liner if you need to handle MIME-wrapped payloads in your own code.",
          ],
        },
        {
          heading: "Length is not a multiple of four — missing padding",
          paragraphs: [
            "Standard Base64 always pads to a length divisible by four. URL-safe Base64 often omits the trailing `=` characters. If you paste a URL-safe payload into the standard decoder, the length mismatch will throw.",
            "Pad the input with `=` until its length is a multiple of four, then decode. The URL-safe decoder in this tool already handles this internally.",
          ],
        },
        {
          heading: "Decoded output is garbage / mojibake",
          paragraphs: [
            "If decoding succeeds but the output is unreadable Chinese-character soup or `Ã©` instead of `é`, the source was encoded from a non-UTF-8 buffer — most often Latin-1 or Windows-1252.",
            "There is no in-band signal for the source encoding in Base64 itself; the producer must communicate it out-of-band. If you control the producer, switch it to UTF-8 before encoding. If you do not, decode through a `TextDecoder` configured with the correct legacy encoding (`new TextDecoder('windows-1252').decode(bytes)`).",
          ],
        },
        {
          heading: "Encoding a file vs encoding a string",
          paragraphs: [
            "Our tool encodes the text in the input box. If you need to encode a binary file (image, PDF, audio), this is the wrong workflow — the file's bytes would have to be read first, and the textarea cannot accept binary input.",
            "Use a quick browser snippet instead: `const reader = new FileReader(); reader.onload = () => console.log(reader.result); reader.readAsDataURL(file);` reads the file and emits a `data:` URL whose payload is the Base64 of the file's bytes. Strip the `data:mime/type;base64,` prefix to get the raw encoding.",
          ],
        },
        {
          heading: "Best-practice checklist before pasting a payload",
          paragraphs: [
            "These five habits cover almost every authoring-time mistake and are essentially free once memorised.",
          ],
        },
      ],
      bullets: [
        "Match the variant to the consumer — JWTs and URLs use URL-safe; data URLs and email use standard.",
        "Strip whitespace before decoding payloads that came from line-wrapped sources (raw email, PEM).",
        "Pad URL-safe payloads with `=` to a multiple of four before feeding them to a standard decoder.",
        "Confirm the source was UTF-8 before complaining about mojibake — the encoder cannot recover what the producer never sent.",
        "Remember Base64 is not encryption; anyone can decode it. Use it for transport, not for secrecy.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 浏览器原生 BTOA / ATOB",
  title:
    "2026 年的 Base64：RFC 4648、URL-safe 变体，以及为什么浏览器已经把所有零件备齐了",
  lead:
    "Base64 是 Web 的万能胶——只要二进制数据必须经由「为文本设计」的传输通道传过去，就得请它出来。语法有五十年历史，浏览器 API 只有四个字符那么短，但开发者依然年复一年地踩同样几个坑：UTF-8、URL 安全、33% 的体积税。本页就是这款工具背后的契约：我们到底在编码什么、我们怎么编码、以及我们刻意不去做哪些「贴心补救」。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "Base64 比大多数使用它的协议都更老。它早于 Web，早于 JSON，早于现代 URL 语法。理解规范到底说了什么、不同消费者期望哪种方言，是「payload 在哪都跑得通」和「莫名其妙在某一个端点上炸」的分水岭。",
      subsections: [
        {
          heading: "RFC 4648 —— 本工具实际执行的规范",
          paragraphs: [
            "Base64 最早出现在 1987 年的 RFC 989（Privacy-Enhanced Mail）中，1996 年被 RFC 2045 拉进 MIME，2006 年终于在 RFC 4648 里被独立标准化。§4 定义标准字母表 —— A-Z、a-z、0-9，外加 `+` 和 `/`，以 `=` 作为填充字符。§5 定义 URL-safe 变体 —— 同样的字母表，但把 `+` 换成 `-`、`/` 换成 `_`，填充字符可省略。",
            "两个变体都是把三个输入字节编码为四个输出字符。两字节输入会得到四字符输出加一个 `=` 填充；一字节输入会得到四字符输出加两个 `=`。字母表的选择保证了每个字符都能安全穿越 7-bit ASCII 传输 —— 没有控制码、不需要转义、不需要引号。这就是 Base64 存在的全部理由：1990 年代之前的邮件中继不能可靠传递任意字节，所以二进制 payload 必须被「洗」进一个能撑过每一跳的 64 字符字母表里。",
            "我们的工具严格实现 RFC 4648 §4（默认）和 §5（URL-safe 开关）。我们不实现 Base32、Base58（比特币用的）或 Base85（Adobe PDF 用的）—— 那些是不同字母表、不同问题域的编码。",
          ],
        },
        {
          heading: "Base64 真正出现在现代技术栈的哪些位置",
          paragraphs: [
            "生产流量里压倒性比例的 Base64 使用都集中在四个场景。每个场景都有自己的方言怪癖，也都有自己「用错变体就炸」的失败模式。",
            "第一，data URL。`data:image/png;base64,iVBORw0KG...` 让你把一份二进制资源直接内联进 HTML 或 CSS。这里必须用标准字母表；浏览器对 `data:` URI 不接受 URL-safe 变体，因为这个 scheme 比 RFC 4648 §5 还要早。",
            "第二，JSON Web Tokens。一份 JWT 是三段以点分隔的 URL-safe Base64：header、payload、signature。这里必须用 URL-safe，因为 JWT 会出现在 `Authorization` header、URL 片段、Cookie 值里 —— `+` 和 `/` 在这些位置都需要转义。填充字符也会被剥掉。",
            "第三，HTTP Basic 认证。`Authorization: Basic ` + 标准 Base64 编码的 `username:password`。这里用标准变体是对的，因为值在 header 里、不在 URL 里。",
            "第四，邮件附件。MIME 部分用标准字母表编码，并按 RFC 2045 在第 76 个字符处折行。本工具不插入折行——现代消费者（JSON API、data URL、JWT）全都拒绝嵌入的换行符；如果你确实需要为 SMTP 中继做 76 字符折行，请用一个 76 字符的 chunker 后处理一下输出即可。",
          ],
        },
        {
          heading: "为什么需要两个变体 —— URL-safe 的来龙去脉",
          paragraphs: [
            "RFC 4648 起草时，URL 语法（RFC 3986）已经把 `+` 当作 `application/x-www-form-urlencoded` 中等价于空格的字符、把 `/` 当作路径分隔符保留了。一段标准 Base64 字符串直接塞进查询参数，会被发送方和接收方之间每一个 URL 解析器搞坏：`+` 可能变成空格、`/` 可能被当作路径边界、`=` 虽然允许但很难看。",
            "URL-safe 变体通过替换两个字符来解决这个问题：`+` → `-`，`/` → `_`。这两个替换字符都是 RFC 3986 中的 unreserved 字符，意味着不会有任何 URL 解析器去碰它们。URL-safe 变体里填充字符也是可选的 —— 大多数消费者（包括几乎所有主流 JWT 库）都会剥掉结尾的 `=`，因为解码器可以从输入长度推断填充量。",
            "经验法则：只要编码后的值会出现在 URL、文件名、需要熬过重定向的 HTTP header、或 JWT 里，就选 URL-safe；其他场景一律选标准变体。拿不准时，默认选标准变体更安全，因为接受它的消费者更多。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "我们的实现是十五行 TypeScript，外加一个 `TextEncoder`/`TextDecoder` 用来处理 UTF-8，再加一对替换 URL-safe 字符的正则。真正有意思的工程在于「我们刻意没做什么」。",
      subsections: [
        {
          heading: "决策 1 · 为什么单靠 `btoa` 不够",
          paragraphs: [
            "`btoa(\"hello\")` 返回 `\"aGVsbG8=\"`；`btoa(\"你好\")` 直接抛 `InvalidCharacterError`。原因是历史包袱：`btoa` 比平台对 UTF-8 的觉醒还要早。它期待一个「二进制字符串」，里面每个字符的码点都在 0-255 范围内 —— 本质上是一段 Latin-1 缓冲区。任何超过 255 的码点都会被拒绝。",
            "标准修法是 `TextEncoder` 桥。我们先用 `new TextEncoder().encode(input)` 把输入串转成 UTF-8 的 `Uint8Array`；然后把每个字节用 `String.fromCharCode(b)` 映射成一个 Latin-1 字符；最后把这段字符串喂给 `btoa`。反向链路用 `atob` 拿到一段 Latin-1 字符串，把每个字符的码点拷进 `Uint8Array`，再用 `new TextDecoder().decode(bytes)` 还原成 JavaScript 字符串。",
            "这是规范化的写法，MDN 在 `btoa` 词条下就是这么记录的，npm 上每一个现代 Base64 库实质上都在跳同一支舞。唯一的替代方案是手写一份词法分析器，那既更慢、更大、也更容易出 bug。",
          ],
        },
        {
          heading: "决策 2 · `btoa` 和 `atob` 至今仍是 SIMD 级别的快",
          paragraphs: [
            "很容易因为 `btoa` 的名字看起来「年代久远」就以为它一定慢。它不慢。V8、JSC、SpiderMonkey 都把 `btoa`/`atob` 实现为带 SIMD 加速的 C++ intrinsic，无论 x86 还是 ARM 上，吞吐都在 GB/s 量级，编码和解码都一样。",
            "在用户态 JavaScript 重写 Base64 会是严格的退步。唯一合理的场景是流式处理 —— 当输入超过浏览器字符串长度上限时 —— 但到那种规模，你应该用 `FileReader` 或 `ReadableStream`，而不是一个 Base64 textarea。",
          ],
        },
        {
          heading: "决策 3 · URL-safe 只是一对正则替换",
          paragraphs: [
            "RFC 4648 §5 跟 §4 的差异精确到三个字符。把标准编码转成 URL-safe 就是 `encodeBase64(input).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')`。解码时把替换反过来，再把长度补齐到 4 的倍数，然后调用标准解码器。",
            "没有单独的解析器。整个变换只是输入字母表里六个字符在字符串边界做了交换，加上解码侧把填充补回来。这就是 URL-safe 变体的全部。那些把 `base64url` 做成一个单独 codec 模块的库，多花的钱什么都没买到。",
          ],
        },
        {
          heading: "决策 4 · 错误真正来自哪里",
          paragraphs: [
            "`atob` 在输入包含字母表之外的字符、或在去除填充后长度不是 4 的倍数时，会抛 `InvalidCharacterError`。它**不会**在「解出来不是合法 UTF-8」时抛错 —— 那个失败由 `TextDecoder.decode` 抛出，需要配置 `{ fatal: true }` 才会显式抛而不是吐替换字符。",
            "我们的 `decodeBase64` 捕获 `atob` 的抛错，UI 上呈现一条本地化错误信息，刻意不尝试自动修复输入。自动修复 —— 自动 trim 空白、自动补填充、自动替换字符 —— 听上去贴心，但容易盖住上游真正的 bug。如果生产端在吐畸形 Base64，正确的修复是去修生产端，而不是在解码端做掩护。",
          ],
        },
        {
          heading: "决策 5 · 33% 的体积税，一句话说清",
          paragraphs: [
            "Base64 每六个输入比特发射一个 ASCII 字符。四个输出字符承载三个输入字节，所以编码后大小精确等于 `ceil(input_bytes / 3) * 4`，加上填充大约是原长度的 133%。",
            "这 33% 不是 bug，是 6-bit-per-char 字母表必然付出的代价。如果你的传输通道接受不了 33% 开销，你想要的就不是 Base64 —— 而是 gzip（先压缩再考虑要不要 Base64）或者一个二进制安全的协议，比如 `multipart/form-data`、`application/octet-stream`。",
          ],
        },
        {
          heading: "决策 6 · 浏览器标签页就是整个沙箱",
          paragraphs: [
            "整个工具的所有逻辑都在加载这个页面的引擎实例里运行。没有 Service Worker、没有 Web Worker、没有 `fetch` 去后端、没有 `localStorage` 写入。textarea 的内容生活在组件状态里，标签页关闭即被释放。",
            "这条性质带来一个安全相关的副产品：在这里粘贴的任何 Base64 凭据对我们的基础设施完全不可见。我们没有可以记录它的端点，甚至没有可以拦截它的请求处理函数。一次信息泄漏的爆炸半径，正好等于你自己浏览器标签页的半径。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "几乎所有 Base64 失败都能追溯到四类根因之一：变体选错（标准 vs URL-safe）、填充字符缺失、输入里夹杂空白、源不是 UTF-8。每一类被识别之后都能在几秒钟内修好。",
      subsections: [
        {
          heading: "`InvalidCharacterError` —— 变体不匹配，或字符越界",
          paragraphs: [
            "如果你拿标准解码器去解一段 JWT 片段，`atob` 会在第一次遇到 `-` 或 `_` 时抛错。修法是在本工具里打开 URL-safe 开关，或者在自己代码里换用专门的 URL-safe 解码器。",
            "反过来，如果 payload 含 `+` 或 `/`，而你又开着 URL-safe 开关，URL-safe 解码器同样会拒绝。让变体匹配源。",
          ],
        },
        {
          heading: "`InvalidCharacterError` —— 嵌入了空白或换行符",
          paragraphs: [
            "标准 `atob` 不接受输入中的空白字符。MIME Base64（RFC 2045）每 76 个字符折一次行，所以从邮件原文里直接拷贝的 payload 会含 `\\r\\n`，在现代浏览器里直接报错。",
            "解码前用 `input.replace(/\\s+/g, '')` 把空白剥掉。本工具刻意**不**自动剥 —— 目标是把坏输入暴露出来，而不是悄悄改写它；但如果你在自己代码里要处理 MIME 折行 payload，这就是一行修法。",
          ],
        },
        {
          heading: "长度不是 4 的倍数 —— 缺填充",
          paragraphs: [
            "标准 Base64 永远把长度补到 4 的倍数。URL-safe Base64 经常省掉结尾的 `=`。如果你把 URL-safe payload 喂给标准解码器，长度不对就会抛错。",
            "用 `=` 把输入补到 4 的倍数再解码即可。本工具的 URL-safe 解码器内部已经在做这件事。",
          ],
        },
        {
          heading: "解出来是乱码 / 中文变方块",
          paragraphs: [
            "如果解码本身成功，但输出是一串「Ã©」之类的 mojibake 或者中文乱码，那说明源不是从 UTF-8 缓冲编码出来的 —— 多数情况下是 Latin-1 或 Windows-1252。",
            "Base64 本身没有传递源编码的带内信号；生产端必须带外说明。如果生产端在你手里，把它切到 UTF-8 再编码。如果不在，就用配置了正确遗留编码的 `TextDecoder` 来解码：`new TextDecoder('windows-1252').decode(bytes)`。",
          ],
        },
        {
          heading: "编码字符串 vs 编码文件",
          paragraphs: [
            "本工具只编码输入框里的文本。如果你要把一个二进制文件（图片、PDF、音频）转成 Base64，这不是合适的工作流 —— 文件的字节得先被读进来，而 textarea 不能接受二进制输入。",
            "在浏览器里跑一段小脚本就够了：`const reader = new FileReader(); reader.onload = () => console.log(reader.result); reader.readAsDataURL(file);` 会读文件并吐出一个 `data:` URL，其 payload 就是文件字节的 Base64。把 `data:mime/type;base64,` 前缀去掉即为纯编码结果。",
          ],
        },
        {
          heading: "粘贴 payload 之前的最佳实践清单",
          paragraphs: [
            "下面五条习惯一旦养成基本是零成本的，但能消灭手写 Base64 阶段几乎所有错误。",
          ],
        },
      ],
      bullets: [
        "让变体匹配消费者 —— JWT 与 URL 用 URL-safe，data URL 与邮件用标准变体。",
        "解码来自折行源（邮件原文、PEM）的 payload 前，先把空白字符剥掉。",
        "把 URL-safe payload 用 `=` 补到 4 的倍数，再交给标准解码器。",
        "抱怨乱码之前先确认源是 UTF-8 —— 解码器没法还原生产端从未发送过的信息。",
        "记住 Base64 不是加密 —— 任何人都能解开它。它是用来传输的，不是用来保密的。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
