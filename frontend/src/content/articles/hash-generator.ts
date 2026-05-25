import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · SHA-2 IN THE BROWSER",
  title:
    "Hashing in 2026: SHA-256 by default, Web Crypto under the hood, and the algorithms you should never reach for again",
  lead:
    "A cryptographic hash is the closest thing the web has to a fingerprint primitive: deterministic, fixed-size, one-way, and collision-resistant. Modern browsers ship the entire SHA-2 family as a native intrinsic — `crypto.subtle.digest` — so a correct implementation is a four-line function. The hard part is not the math; it is choosing the right algorithm, recognising when a hash is the wrong tool, and resisting the urge to invent your own. This page is the contract under our tool: what we compute, how we compute it, and which legacy algorithms we deliberately refuse to expose.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Hash function design is one of the rare areas where the standards body output is genuinely settled. NIST has published every algorithm worth using and explicitly retired the ones that are not. Understanding that lineage is the difference between picking a primitive that will still be acceptable in 2040 and picking one that auditors flagged a decade ago.",
      subsections: [
        {
          heading: "FIPS 180-4 — the spec this tool enforces",
          paragraphs: [
            "Our four algorithms — SHA-1, SHA-256, SHA-384, and SHA-512 — are all defined in NIST FIPS 180-4 (the Secure Hash Standard). SHA-1 was published in 1995, the SHA-2 family in 2001, and the current revision (FIPS 180-4) consolidated them in 2015. SHA-256 and SHA-512 are the workhorses; SHA-384 is SHA-512 with a different initial state and a truncated output, useful when you want the speed of the 64-bit-word pipeline but only need 384 bits of digest.",
            "FIPS 180-4 is not the only hash standard a developer encounters. FIPS 202 defines SHA-3 (Keccak), which is a structurally different sponge construction designed as an insurance policy against future cryptanalytic breakthroughs in SHA-2. SHA-3 is excellent, but it is also slower than SHA-2 on every commodity CPU and is not exposed by the Web Crypto API today, so this tool does not include it. If your threat model requires SHA-3 specifically, you are operating in a regime that probably should not be using a browser textarea anyway.",
            "The Web Crypto API itself is specified by W3C in the `WebCryptoAPI` standard. `crypto.subtle.digest(algorithm, data)` accepts the four algorithm strings we expose plus `SHA-1`, returns a `Promise<ArrayBuffer>`, and is implemented as a constant-time C++ intrinsic in every major browser engine.",
          ],
        },
        {
          heading: "Where cryptographic hashes actually show up in production",
          paragraphs: [
            "Five use-cases dominate. Each one carries its own algorithm preference and its own failure mode when the wrong primitive is chosen.",
            "First, integrity verification. Download a release tarball, compute its SHA-256, compare against a checksum the publisher signed. The hash itself is not the security boundary — the signature on the checksum is — but the hash is the cheap part of the chain. SHA-256 is the default for this purpose because every package manager, every CDN, and every Linux distribution already uses it.",
            "Second, content addressing. Git object IDs, IPFS CIDs, Docker image digests, and Subresource Integrity (`integrity=\"sha384-...\"`) in HTML all use a hash as the canonical name of a blob. The hash being collision-resistant means two distinct blobs cannot share a name; the hash being deterministic means the same blob always resolves to the same name. Git is mid-migration from SHA-1 to SHA-256; everyone else has already landed.",
            "Third, password storage — but only as a building block. Raw SHA-256 of a password is catastrophically wrong because GPUs can compute it at gigahash speeds. Production password storage uses a slow, memory-hard KDF (Argon2id, bcrypt, scrypt) that internally calls SHA-256 thousands of times with per-user salt. This tool does not implement password hashing; it is intentionally a primitive, not a credential vault.",
            "Fourth, digital signatures. RSA-PSS, ECDSA, and Ed25519 all hash the message first and sign the hash. The signature standard pins the hash algorithm; you do not get to pick. SHA-256 is the floor for any new signature scheme; SHA-384 is required for some compliance regimes (TLS 1.3 with ECDSA-P384, certain government PKI profiles).",
            "Fifth, deduplication. Cloud storage backends, backup systems, and chunked filesystems hash blocks to detect duplicates before storing them. Any collision-resistant hash works here; SHA-256 dominates because the hardware is already there.",
          ],
        },
        {
          heading: "Why SHA-1 is still on the menu — and why it shouldn't be your default",
          paragraphs: [
            "SHA-1 is included in our tool because legacy systems still emit it. Git history before 2018 is SHA-1. Older TLS certificates were SHA-1-signed. Subversion repositories, some FOSS package mirrors, and a long tail of internal tooling at large companies still expose SHA-1 checksums. If you have to compare against a published SHA-1 value, you need a SHA-1 computer.",
            "But SHA-1 is broken as a cryptographic primitive. In 2017, the SHAttered attack (Google + CWI Amsterdam) produced two distinct PDF files with the same SHA-1 digest at a cost of roughly 110 GPU-years — well within the means of a determined adversary today. CWI's SHA-1 collision was followed by the 2019 chosen-prefix collision, which dropped the cost further and let an attacker generate collisions on arbitrary inputs.",
            "Practical consequences: do not use SHA-1 for new signature schemes, content addressing, or anywhere collision resistance is part of the threat model. Do use it when a legacy producer hands you a SHA-1 checksum and you need to verify integrity against random corruption — not adversarial substitution.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Our implementation is six lines of TypeScript on top of `crypto.subtle.digest`. The interesting engineering is in what we deliberately do NOT do — and in how the platform makes that minimalism possible.",
      subsections: [
        {
          heading: "Step 1 — `TextEncoder` is the only encoding decision",
          paragraphs: [
            "`crypto.subtle.digest` takes an `ArrayBuffer` or `Uint8Array`, not a string. The string-to-bytes step is the only place a hash function can produce different outputs for inputs that look the same to a human, so it has to be pinned. We pin it to UTF-8 via `new TextEncoder().encode(input)`, which is the only encoding the spec exposes.",
            "This matters because a SHA-256 of the string `\"你好\"` in UTF-8 is different from a SHA-256 of `\"你好\"` in GB18030. Both are valid byte sequences for the same human-readable text, but their digests have nothing in common. Any tool that does not document its encoding is broken; any consumer that does not pin its encoding is shipping a bug.",
          ],
        },
        {
          heading: "Step 2 — Why `crypto.subtle.digest` returns a Promise",
          paragraphs: [
            "Every Web Crypto operation is asynchronous, even though SHA-256 of a 100-character string finishes in microseconds on a modern CPU. The design choice is deliberate: the same API contract has to support hardware-accelerated operations (RSA key generation, ECDSA on a TPM) that genuinely take milliseconds, and tying the synchronous and asynchronous worlds together would have forced one or the other to lose.",
            "The cost is one `await` in your codepath. The benefit is that streaming large inputs through Web Crypto never blocks the main thread, and the same API works identically in a Web Worker, a Service Worker, or a Node.js process via `globalThis.crypto.subtle`.",
          ],
        },
        {
          heading: "Step 3 — Hex output is a presentation choice, not a hash property",
          paragraphs: [
            "`crypto.subtle.digest` returns raw bytes. A SHA-256 digest is exactly 32 bytes, period. The 64-character hex string you see in this tool is one way to render those bytes; Base64 is another (44 characters with padding); Base64url is a third (43 characters without padding); raw binary is the most compact (32 bytes). All four representations carry exactly the same information.",
            "We chose hex because it is the dominant representation in checksums, Git object IDs, and most compliance documentation. The conversion is one line: `Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')`. If you need Base64 instead, run the raw bytes through `btoa(String.fromCharCode(...new Uint8Array(digest)))`.",
          ],
        },
        {
          heading: "Step 4 — SHA-256 vs SHA-512: a 64-bit-word story",
          paragraphs: [
            "SHA-256 is built on 32-bit word arithmetic. SHA-512 is built on 64-bit word arithmetic with a doubled block size (1024 bits vs 512). On a 64-bit CPU, SHA-512 is actually faster than SHA-256 per byte hashed — the pipeline is wider and the message schedule has more work per round. On a 32-bit CPU (rare today, but still present in embedded ARM), the picture flips and SHA-256 wins decisively.",
            "Output size is the other axis. SHA-256 emits 256 bits; SHA-512 emits 512 bits. If you only need 128 bits of collision resistance, SHA-256 is overkill in storage but fine in CPU. If you need 192+ bits of collision resistance (NIST recommends this floor for new systems with a long deployment horizon), SHA-256 still meets the bar — its security level is `output_bits / 2` against collisions.",
            "SHA-384 exists for one specific reason: it is SHA-512 truncated to 384 bits with a different initial state. The different initial state means a SHA-384 digest is not a prefix of a SHA-512 digest, so an attacker cannot use a SHA-512 oracle to forge SHA-384 outputs. It is the algorithm of choice when you want 192-bit collision resistance and you are already on a 64-bit pipeline.",
          ],
        },
        {
          heading: "Step 5 — What this tool deliberately does not implement",
          paragraphs: [
            "We omit MD5, SHA-0, CRC32, and FNV. MD5 is collision-broken (single-block collisions in seconds on commodity hardware) and chosen-prefix-broken (real-world cert forgery demonstrated in 2008). SHA-0 was withdrawn before SHA-1 shipped. CRC32 is not a cryptographic hash — it is an error-detection code with three bytes of output and zero adversarial security; treating it as a hash is a category error. FNV is a non-cryptographic hash used inside hash tables; using it for integrity is the same category error.",
            "We also omit HMAC, PBKDF2, Argon2id, scrypt, and bcrypt. Those are KDFs and MACs, not hashes — they answer different questions (\"prove you knew this secret\", \"derive a key from this password slowly\"). Mixing primitives is how cryptographic systems fail; a separate tool will cover them when we add it.",
          ],
        },
        {
          heading: "Step 6 — The browser tab is the entire trust boundary",
          paragraphs: [
            "Everything runs inside the engine instance that loaded this page. The input never leaves the tab. There is no Service Worker logging digests, no `fetch` to a backend, no `localStorage` write. The textarea content lives in component state and is garbage-collected when the tab closes.",
            "That property matters because a hash of a sensitive value (a password, a private key fingerprint, a session token) is sometimes itself sensitive — knowing the digest narrows the search space for an offline guessing attack. Computing it in your own browser tab guarantees we never see it. Our infrastructure has no endpoint that could log it; we do not even have a request handler that could intercept it.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Almost every hash mismatch traces back to one of four root causes: encoding mismatch (UTF-8 vs Latin-1 vs UTF-16), trailing whitespace or newline, wrong algorithm, or the input being a file rather than a string. Each is recognisable in seconds once you know the pattern.",
      subsections: [
        {
          heading: "Digest does not match the published checksum",
          paragraphs: [
            "First check: encoding. If the publisher hashed the raw bytes of a file and you hashed the file's textual content, you will get different digests even if the file looks identical. SHA-256 of a UTF-8 string with a trailing newline is different from SHA-256 of the same string without one — the newline is one byte of input.",
            "Second check: line endings. A file checked out on Windows with CRLF line endings hashes differently from the same file on Linux with LF. Many checksum manifests are computed on LF-normalised bytes; if Git silently converted your line endings on checkout, your local hash will not match.",
            "Third check: algorithm. Confirm the publisher used the same algorithm — a SHA-256 digest is 64 hex characters; SHA-512 is 128; SHA-1 is 40. If the lengths do not line up, you picked the wrong algorithm.",
          ],
        },
        {
          heading: "Hex output looks correct but consumer rejects it",
          paragraphs: [
            "Some consumers expect uppercase hex (`A1B2...`), others expect lowercase (`a1b2...`). Our tool emits lowercase because that is the dominant convention (Git, SRI, npm, OpenSSL). If your consumer wants uppercase, run `.toUpperCase()` on the output.",
            "Other consumers expect Base64 or Base64url encoding instead of hex. SRI integrity attributes in HTML use Base64 (`sha384-...`). If you see `sha384-` followed by characters that include `+`, `/`, or `=`, the digest is Base64, not hex.",
          ],
        },
        {
          heading: "Hashing a file vs hashing a string",
          paragraphs: [
            "Our tool hashes the text in the input box. If you need to hash a binary file (a downloaded tarball, an image, an executable), this is the wrong workflow — the file's bytes have to be read first, and the textarea cannot accept binary input.",
            "Use a quick browser snippet instead: `const buf = await file.arrayBuffer(); const digest = await crypto.subtle.digest('SHA-256', buf); const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');`. That reads the file, hashes the raw bytes, and renders the digest as hex. For very large files, prefer the command line — `sha256sum file.tar.gz` on Linux/macOS, or `Get-FileHash -Algorithm SHA256 file.tar.gz` in PowerShell.",
          ],
        },
        {
          heading: "Same input, same algorithm, different digest across tools",
          paragraphs: [
            "Almost always an encoding problem. Some older tools default to Latin-1 or Windows-1252 input encoding; Python 2's `hashlib.sha256('你好').hexdigest()` errors out, while Python 3's `hashlib.sha256('你好'.encode('utf-8')).hexdigest()` matches our output exactly.",
            "If you are bridging between a Java backend (`MessageDigest.getInstance(\"SHA-256\").digest(input.getBytes(StandardCharsets.UTF_8))`) and this tool, the digests will match byte-for-byte. If you see a mismatch, the backend is using the platform default charset, which on a misconfigured server can be anything from US-ASCII to GBK.",
          ],
        },
        {
          heading: "\"Why is SHA-256 slow on my huge input?\"",
          paragraphs: [
            "Web Crypto is fast — on the order of 500 MB/s on a modern laptop CPU. But `crypto.subtle.digest` is one-shot: you give it the full input, it returns the full digest. If you paste a 100 MB string into the textarea, the browser allocates a 100 MB UTF-8 buffer before the hash can start.",
            "For streaming or very large inputs, use a Web Worker plus `crypto.subtle.digest` per chunk is NOT correct (chunk digests are not the same as a digest of the concatenated chunks). The right answer is the platform's streaming `Hash` API exposed via Node.js, or a WebAssembly SHA implementation like `hash-wasm` that exposes `update()`/`digest()` semantics. The textarea workflow in this tool is intentionally bounded to inputs that fit in a single string.",
          ],
        },
        {
          heading: "Best-practice checklist before publishing a checksum",
          paragraphs: [
            "Six habits that prevent almost every hash-related production incident.",
          ],
        },
      ],
      bullets: [
        "Pin the encoding to UTF-8 and document it in the same place as the checksum.",
        "Pick SHA-256 unless you have a specific reason (compliance, signature scheme) to pick something else.",
        "Never use raw SHA-* on a password — reach for Argon2id, bcrypt, or scrypt with a per-user salt.",
        "Treat SHA-1 as legacy-read-only: verify when forced to, but never produce new SHA-1 signatures.",
        "Sign the checksum (PGP, Sigstore, X.509) — the hash itself is not a security boundary without provenance.",
        "Remember a hash is not encryption; anyone with the same input can reproduce it, and short-domain inputs (PINs, English words) are trivially guessable by brute force.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 浏览器原生 SHA-2",
  title:
    "2026 年的哈希：SHA-256 是默认值，Web Crypto 是底层，那些「请永远别再选」的算法",
  lead:
    "密码学哈希是 Web 上最接近「指纹原语」的东西：确定性、定长、单向、抗碰撞。现代浏览器把整个 SHA-2 家族都做成了原生 intrinsic —— `crypto.subtle.digest` —— 一份正确实现就是四行函数。难点不在数学，而在于选对算法、识别「这里不该用哈希」的场景、以及克制「自己发明一种哈希」的冲动。本页就是这款工具背后的契约：我们到底在计算什么、怎么计算、以及哪些遗留算法我们刻意不暴露。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "哈希函数设计是少数几个「标准化机构的产出已经基本尘埃落定」的领域。NIST 把所有值得用的算法都发布完了，也把所有不该用的明确退役了。理解这条谱系，是「选一个 2040 年还能过审的原语」和「选一个十年前就被审计标红的原语」之间的分水岭。",
      subsections: [
        {
          heading: "FIPS 180-4 —— 本工具实际执行的规范",
          paragraphs: [
            "我们提供的四种算法 —— SHA-1、SHA-256、SHA-384、SHA-512 —— 都定义在 NIST FIPS 180-4（Secure Hash Standard）里。SHA-1 发布于 1995 年，SHA-2 家族发布于 2001 年，当前修订版（FIPS 180-4）在 2015 年把它们整合在一起。SHA-256 和 SHA-512 是日常主力；SHA-384 是用不同初始状态、再截断输出的 SHA-512，用在「想要 64 位字管线的速度但只需要 384 位摘要」的场景。",
            "FIPS 180-4 不是开发者遇到的唯一哈希标准。FIPS 202 定义了 SHA-3（Keccak），它是结构上完全不同的海绵构造，作为 SHA-2 一旦被破解时的保险。SHA-3 设计上很出色，但在所有商用 CPU 上都比 SHA-2 慢，而且 Web Crypto API 至今没有暴露它，所以本工具不包含。如果你的威胁模型确实要求 SHA-3，那你已经身处「大概不该用浏览器 textarea」的工作模式了。",
            "Web Crypto API 本身由 W3C 的 `WebCryptoAPI` 规范定义。`crypto.subtle.digest(algorithm, data)` 接受我们暴露的四种算法字符串（再加上 `SHA-1`），返回 `Promise<ArrayBuffer>`，在每个主流浏览器引擎里都是常数时间的 C++ intrinsic 实现。",
          ],
        },
        {
          heading: "密码学哈希真正出现在生产里的哪些位置",
          paragraphs: [
            "压倒性比例的使用都集中在五个场景。每个场景都有自己的算法偏好和「用错原语就翻车」的失败模式。",
            "第一，完整性校验。下载一份发布包，算它的 SHA-256，跟发布者签过名的 checksum 对比。哈希本身不是安全边界 —— 签在 checksum 上的签名才是 —— 但哈希是这条链里便宜的那一段。SHA-256 是这类用途的默认值，因为每一个包管理器、每一个 CDN、每一个 Linux 发行版都已经在用了。",
            "第二，内容寻址。Git 对象 ID、IPFS CID、Docker 镜像 digest、以及 HTML 里的 SRI（`integrity=\"sha384-...\"`），都把哈希当成 blob 的规范名。抗碰撞性保证两个不同 blob 不会撞名；确定性保证同一份 blob 永远解析到同一个名字。Git 正在从 SHA-1 向 SHA-256 迁移；其他生态系统大部分已经完成迁移了。",
            "第三，密码存储 —— 但只作为构件。直接用 SHA-256 哈希密码是灾难级错误，因为 GPU 能跑出每秒数十亿次 SHA-256。生产级密码存储要用「慢、且需要大量内存」的 KDF（Argon2id、bcrypt、scrypt），它们内部会带着每用户 salt 调用 SHA-256 上千次。本工具不实现密码哈希；它有意是一个原语，不是凭据保险柜。",
            "第四，数字签名。RSA-PSS、ECDSA、Ed25519 都是先哈希消息、再签哈希。签名标准把哈希算法钉死，你没的选。任何新的签名方案 SHA-256 是地板；某些合规体系（带 ECDSA-P384 的 TLS 1.3、部分政务 PKI 配置）要求 SHA-384。",
            "第五，去重。云存储后端、备份系统、分块文件系统都先哈希块、再决定要不要写入存储。任何抗碰撞哈希都能干，SHA-256 占主导地位是因为硬件已经在那儿了。",
          ],
        },
        {
          heading: "为什么 SHA-1 还在菜单上 —— 以及为什么不应该是你的默认",
          paragraphs: [
            "我们把 SHA-1 留在工具里，因为遗留系统还在产出它。2018 年之前的 Git 历史是 SHA-1；老 TLS 证书签的是 SHA-1；Subversion 仓库、部分 FOSS 包镜像、大公司内部一长尾工具，都还在暴露 SHA-1 checksum。如果你要跟某个公开的 SHA-1 值对比，你就需要一个能算 SHA-1 的工具。",
            "但 SHA-1 作为密码学原语已经破了。2017 年 SHAttered 攻击（Google + CWI Amsterdam）以约 110 GPU-年的成本产出了两份具有相同 SHA-1 摘要的不同 PDF —— 这是当下有决心的攻击者完全能负担的预算。CWI 的 SHA-1 碰撞之后，2019 年又有了 chosen-prefix 碰撞，进一步压低成本，让攻击者能在任意输入上造出碰撞。",
            "实际后果：不要在新的签名方案、内容寻址、或任何把抗碰撞性纳入威胁模型的地方使用 SHA-1。可以在「遗留生产者递给你一段 SHA-1 checksum、你只想校验是否随机损坏」的场景下用 —— 但不是用来防御主动替换。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "我们的实现是六行 TypeScript，跑在 `crypto.subtle.digest` 之上。真正有意思的工程在于「我们刻意没做什么」—— 以及平台是怎么让这种极简成为可能的。",
      subsections: [
        {
          heading: "决策 1 · `TextEncoder` 是唯一的编码决定",
          paragraphs: [
            "`crypto.subtle.digest` 接受 `ArrayBuffer` 或 `Uint8Array`，不接受字符串。「字符串到字节」这一步是哈希函数能对「人眼看起来一样的输入」吐出不同结果的唯一位置，所以必须钉死。我们用 `new TextEncoder().encode(input)` 钉成 UTF-8 —— 这是规范向我们暴露的唯一编码。",
            "这一点很重要：UTF-8 下的 `\"你好\"` 的 SHA-256 跟 GB18030 下的 `\"你好\"` 的 SHA-256 没有任何关系。两个字节序列都是同一段「人类可读文本」的合法编码，但它们的摘要毫不相干。任何「不记录自己用什么编码」的工具都是有 bug 的；任何「不钉死自己用什么编码」的消费者都在出 bug。",
          ],
        },
        {
          heading: "决策 2 · 为什么 `crypto.subtle.digest` 返回 Promise",
          paragraphs: [
            "所有 Web Crypto 操作都是异步的 —— 哪怕一段 100 字符字符串的 SHA-256 在现代 CPU 上微秒级就能算完。这种设计是刻意的：同一份 API 契约必须撑住「硬件加速的操作」（在 TPM 上的 RSA 密钥生成、ECDSA），那些是真正会跑到毫秒级的，把同步异步搅在一起会让两边都退步。",
            "代价是你 codepath 里多一个 `await`。收益是「把大输入流式喂进 Web Crypto」永远不会卡主线程，而且同一份 API 在 Web Worker、Service Worker、Node.js（通过 `globalThis.crypto.subtle`）里行为完全一致。",
          ],
        },
        {
          heading: "决策 3 · 十六进制输出是展示选择，不是哈希的属性",
          paragraphs: [
            "`crypto.subtle.digest` 返回原始字节。SHA-256 摘要严格是 32 字节，不多不少。本工具上看到的 64 字符十六进制串只是渲染这些字节的一种方式；Base64 是另一种（带填充 44 字符）；Base64url 是第三种（不带填充 43 字符）；纯二进制是最紧凑的（32 字节）。这四种表示承载的信息完全一致。",
            "我们选十六进制，因为它在 checksum、Git 对象 ID、绝大多数合规文档里都是主导表示。转换是一行：`Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')`。如果你需要 Base64，把原始字节喂给 `btoa(String.fromCharCode(...new Uint8Array(digest)))` 即可。",
          ],
        },
        {
          heading: "决策 4 · SHA-256 vs SHA-512：一个 64 位字长的故事",
          paragraphs: [
            "SHA-256 建立在 32 位字算术之上；SHA-512 建立在 64 位字算术上，且块大小翻倍（1024 比特 vs 512 比特）。在 64 位 CPU 上，按每字节计 SHA-512 实际上比 SHA-256 更快 —— 管线更宽、每一轮的消息调度做更多事。在 32 位 CPU 上（今天已罕见，但嵌入式 ARM 上还存在），局势翻转，SHA-256 完胜。",
            "输出长度是另一个维度。SHA-256 给 256 比特；SHA-512 给 512 比特。如果你只需要 128 比特抗碰撞强度，SHA-256 在存储上是过剩、但在 CPU 上够用。如果你需要 192+ 比特抗碰撞强度（NIST 推荐这是「部署周期长的新系统」的地板），SHA-256 仍然够 —— 它的抗碰撞强度是 `output_bits / 2`。",
            "SHA-384 的存在只为一个具体原因：它是用不同初始状态、再截断到 384 比特的 SHA-512。不同的初始状态意味着 SHA-384 摘要不是某个 SHA-512 摘要的前缀，攻击者不能用 SHA-512 oracle 去伪造 SHA-384 输出。当你想要 192 比特抗碰撞强度、且已经在 64 位管线上跑时，它就是首选算法。",
          ],
        },
        {
          heading: "决策 5 · 本工具刻意不实现的那些算法",
          paragraphs: [
            "我们不提供 MD5、SHA-0、CRC32、FNV。MD5 已经碰撞破了（商用硬件上几秒钟出一组单块碰撞），也被 chosen-prefix 攻击破了（2008 年真实证书伪造被复现）。SHA-0 在 SHA-1 发布前就被撤回了。CRC32 不是密码学哈希 —— 它是 3 字节输出、零抗对手安全的错误检测码，把它当哈希用是范畴错误。FNV 是哈希表内部用的非密码学哈希，用它做完整性是同一种范畴错误。",
            "我们也不提供 HMAC、PBKDF2、Argon2id、scrypt、bcrypt。它们是 KDF 和 MAC，不是哈希 —— 它们回答的是另一类问题（「证明你知道这个秘密」「用密码慢慢推导出一个密钥」）。混用原语是密码学系统垮掉的方式；将来我们会做一个独立工具来覆盖它们。",
          ],
        },
        {
          heading: "决策 6 · 浏览器标签页就是整个信任边界",
          paragraphs: [
            "整个工具的所有逻辑都在加载本页的引擎实例里运行。输入永远不离开标签页。没有 Service Worker 在记录摘要、没有 `fetch` 往后端打、没有 `localStorage` 写入。textarea 的内容生活在组件状态里，标签页关闭即被 GC。",
            "这条性质重要的原因是：某个敏感值（一份密码、一份私钥指纹、一段 session token）的哈希本身有时也是敏感的 —— 知道摘要会大幅缩小离线猜测攻击的搜索空间。在你自己的浏览器标签页里算它，可以保证我们看不到它。我们的基础设施没有可以记录它的端点，甚至没有可以拦截它的请求处理函数。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "几乎所有哈希对不上的失败都能追溯到四类根因之一：编码不匹配（UTF-8 vs Latin-1 vs UTF-16）、末尾多了一个空白或换行、算法选错、或者输入其实是文件不是字符串。每一类被识别之后都能在几秒钟内修好。",
      subsections: [
        {
          heading: "摘要跟发布的 checksum 对不上",
          paragraphs: [
            "第一查：编码。如果发布者哈希的是文件的原始字节，而你哈希的是「文件的文本内容」，那两个摘要会不同，哪怕文件看起来一模一样。一段带末尾换行的 UTF-8 字符串的 SHA-256 跟不带换行的版本不同 —— 那个换行就是一个字节的输入。",
            "第二查：换行符。Windows 上以 CRLF 换行 checkout 的文件，跟 Linux 上以 LF 换行的版本，哈希完全不同。许多 checksum 清单是在「LF 归一化后的字节」上算的；如果 Git 在 checkout 时悄悄帮你转换了换行符，本地哈希就对不上。",
            "第三查：算法。确认发布者用的是同一种算法 —— SHA-256 摘要是 64 个十六进制字符，SHA-512 是 128 个，SHA-1 是 40 个。如果长度对不上，你选错算法了。",
          ],
        },
        {
          heading: "十六进制输出看起来对，但消费者拒收",
          paragraphs: [
            "有些消费者要大写十六进制（`A1B2...`），有些要小写（`a1b2...`）。本工具输出小写，因为这是主导习惯（Git、SRI、npm、OpenSSL）。如果你的消费者要大写，对输出做 `.toUpperCase()` 即可。",
            "其他消费者要的可能不是十六进制而是 Base64 或 Base64url。HTML 里的 SRI integrity 属性用 Base64（`sha384-...`）。如果你看到 `sha384-` 后面跟着包含 `+`、`/`、`=` 的字符，那就是 Base64 而不是十六进制。",
          ],
        },
        {
          heading: "哈希字符串 vs 哈希文件",
          paragraphs: [
            "本工具只哈希输入框里的文本。如果你要哈希一份二进制文件（下载的 tarball、图片、可执行程序），这就不是合适的工作流 —— 文件字节必须先被读进来，而 textarea 不接受二进制输入。",
            "在浏览器里跑一段小脚本就够了：`const buf = await file.arrayBuffer(); const digest = await crypto.subtle.digest('SHA-256', buf); const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');`。这段代码读文件、哈希原始字节、把摘要渲染成十六进制。对超大文件，更建议用命令行 —— Linux/macOS 上的 `sha256sum file.tar.gz`、PowerShell 里的 `Get-FileHash -Algorithm SHA256 file.tar.gz`。",
          ],
        },
        {
          heading: "同样的输入、同样的算法、不同工具给出不同摘要",
          paragraphs: [
            "几乎一定是编码问题。一些老工具默认用 Latin-1 或 Windows-1252 编码输入；Python 2 的 `hashlib.sha256('你好').hexdigest()` 直接报错，而 Python 3 的 `hashlib.sha256('你好'.encode('utf-8')).hexdigest()` 跟本工具的输出逐字节一致。",
            "如果你在一个 Java 后端（`MessageDigest.getInstance(\"SHA-256\").digest(input.getBytes(StandardCharsets.UTF_8))`）和本工具之间架桥，摘要会逐字节匹配。如果你看到不匹配，说明后端用的是平台默认 charset；配置错乱的服务器上，那玩意可能从 US-ASCII 一路退化到 GBK。",
          ],
        },
        {
          heading: "「为什么我的超大输入 SHA-256 这么慢？」",
          paragraphs: [
            "Web Crypto 很快 —— 现代笔记本 CPU 上大约 500 MB/s。但 `crypto.subtle.digest` 是一次性的：你把完整输入交进去，它返回完整摘要。如果你把一段 100 MB 字符串粘进 textarea，浏览器要先分配一块 100 MB 的 UTF-8 缓冲区，哈希才能开始。",
            "对流式或超大输入，「在 Web Worker 里逐块调 `crypto.subtle.digest`」是**错误**做法（多个块各自的摘要不等于拼接起来再哈希）。正确答案是用平台暴露的流式 `Hash` API（Node.js 里有），或者用 WebAssembly 的 SHA 实现（如 `hash-wasm`），它们提供 `update()`/`digest()` 语义。本工具的 textarea 工作流故意限定在「能塞进单个字符串」的输入规模。",
          ],
        },
        {
          heading: "发布 checksum 之前的最佳实践清单",
          paragraphs: [
            "下面这六条习惯能消灭几乎所有哈希相关的生产事故。",
          ],
        },
      ],
      bullets: [
        "把编码钉死在 UTF-8，并在跟 checksum 同一个位置写明这件事。",
        "默认选 SHA-256，除非有明确理由（合规、签名方案）选别的。",
        "永远不要对密码直接做 SHA-*，请使用 Argon2id、bcrypt 或 scrypt 加每用户 salt。",
        "把 SHA-1 当成「只读遗留」：不得不校验时去校验，但永远别再产出新的 SHA-1 签名。",
        "给 checksum 签名（PGP、Sigstore、X.509）—— 没有出处证明的哈希不是安全边界。",
        "记住哈希不是加密 —— 任何拿到同一段输入的人都能复现它；短域输入（PIN、英文单词）暴力穷举非常便宜。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
