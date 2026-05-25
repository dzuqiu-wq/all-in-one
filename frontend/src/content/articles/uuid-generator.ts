import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · RFC 4122 v4 IDENTIFIERS",
  title:
    "UUIDs in 2026: why v4 still wins for application IDs, what v7 changes, and why your database may want both",
  lead:
    "A UUID is 128 bits. Six of those bits are spent on metadata (4 for the version, 2 for the variant); the other 122 are payload. For v4, those 122 bits are uniformly random — drawn from the operating system's CSPRNG through the browser's `crypto.randomUUID` or `crypto.getRandomValues`. That's it. Everything you'll read about UUID generation — collision probability, database performance, v1 vs v4 vs v7, ULID and KSUID — is downstream of that one fact. This page is the contract behind our generator: which RNG we call, why the version bits matter, and when v4 is the right answer versus when a sortable alternative wins.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "UUIDs were standardised by RFC 4122 in 2005, drafted originally for DCE and adopted near-universally for application-level identifiers since. The 2024 revision (RFC 9562) keeps the original five versions and adds three new ones (v6, v7, v8) targeting modern database storage patterns. v4 remains the default for opaque identifiers; v7 is the emerging choice for time-ordered keys.",
      subsections: [
        {
          heading: "RFC 4122 / RFC 9562 — what the five versions actually mean",
          paragraphs: [
            "RFC 4122 defined five UUID versions in 2005, distinguished by the source of the 122 non-metadata bits. v1 encodes the host MAC address plus a 60-bit timestamp; it leaks identity and time of generation. v2 is the DCE Security variant — almost no one uses it. v3 and v5 are name-based: hash a namespace UUID and a name string with MD5 (v3) or SHA-1 (v5) and use the digest. v4 is pure random.",
            "RFC 9562 (May 2024) adds three new versions. v6 is v1 with the timestamp bits reordered so that lexical sort matches creation order — solves the v1 ordering problem but keeps the MAC leak. v7 is v1 minus the MAC: 48-bit Unix-epoch millisecond timestamp followed by 74 random bits, with version (4 bits) and variant (2 bits) interleaved. v8 is a vendor extension slot.",
            "Our generator emits v4 because v4 is what 95% of application code wants: a credential-grade random identifier with no embedded metadata, no clock dependency, no privacy concern. If your use case wants ordering, we recommend a separate tool that emits ULID or v7; we deliberately scoped this surface to one job.",
          ],
        },
        {
          heading: "Where v4 UUIDs actually show up",
          paragraphs: [
            "Five workflows account for almost every legitimate use of a v4 UUID generator like this one.",
            "First, REST resource identifiers — the path segments in `/api/v1/orders/{id}`. Random UUIDs prevent ID-enumeration attacks (you cannot guess the next order ID), survive sharding without coordination, and decouple from the database's auto-increment sequence. The tradeoff is 16 bytes per identifier versus 8 for a `bigint`, plus loss of B-tree locality (see the v7 section below).",
            "Second, idempotency keys — the value clients send in `Idempotency-Key` headers to make `POST` retries safe. Stripe popularised this in 2017; the industry now treats it as standard. A v4 UUID is the right primitive: random enough to never collide across clients, opaque enough to leak nothing about the original request.",
            "Third, correlation / request IDs in distributed tracing. A v4 UUID generated at the edge follows the request through every service, gets logged at each hop, and lets you reconstruct the call graph in Honeycomb or Datadog. OpenTelemetry's W3C `traceparent` header uses a 128-bit trace-id that is structurally a v4 UUID without the dashes.",
            "Fourth, generated file names for user uploads. `${crypto.randomUUID()}.jpg` prevents one user from overwriting another's file via path-collision, defeats directory-listing attacks (the attacker cannot enumerate sibling filenames), and avoids the user-supplied-filename injection class entirely.",
            "Fifth, anonymous client identifiers — a single v4 stored in `localStorage` to distinguish browser sessions before the user authenticates. Lower-stakes than the others; analytics platforms do this routinely. Note that this is *not* a fingerprint and not a privacy mechanism on its own; it's a stable handle for one logical client.",
          ],
        },
        {
          heading: "The collision probability you actually have to worry about",
          paragraphs: [
            "A v4 UUID has 122 random bits, so the space is `2^122 ≈ 5.3 × 10^36` distinct values. By the birthday-bound approximation, you need to generate roughly `sqrt(2^122) ≈ 2.3 × 10^18` UUIDs before a single collision becomes more likely than not. At one million UUIDs per second, that takes 73,000 years.",
            "For application-level scales — even at the scale of \"every web request to a billion-user platform\" — collisions are not the failure mode. The failure mode is *broken RNG*, not *RNG exhaustion*. If your application ever produces two equal v4 UUIDs in normal operation, the bug is upstream: either your CSPRNG is seeded badly (a virtual-machine snapshot replay is the classic), or someone wrote a custom v4 generator on top of `Math.random` instead of `crypto.randomUUID`.",
            "Our generator delegates to `crypto.randomUUID()` which is required by the W3C Web Crypto specification to use a CSPRNG, and falls back to `crypto.getRandomValues` only when `randomUUID` is unavailable. Both paths go through the same OS-kernel entropy pool that backs `getrandom(2)` on Linux, `BCryptGenRandom` on Windows, and `SecRandomCopyBytes` on macOS.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Our implementation is a 25-line TypeScript function. The interesting engineering is in the bit layout (which the platform now hides from you in `crypto.randomUUID`) and in the database-level consequences of choosing v4 over a sortable alternative.",
      subsections: [
        {
          heading: "Step 1 — The bit layout: 4 version, 2 variant, 122 random",
          paragraphs: [
            "A UUID is rendered as `xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx` where M and N encode the version and variant. M is the version digit: it is always `4` for v4 UUIDs. N is the variant — for RFC 4122 it is `8`, `9`, `a`, or `b` (binary `10xx`).",
            "Implemented from raw random bytes, that means: fill 16 bytes from the CSPRNG, then overwrite the top 4 bits of byte 6 with `0100` (version 4), and overwrite the top 2 bits of byte 8 with `10` (variant 10). Our fallback path does exactly this: `bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;`. The remaining 122 bits stay random.",
            "`crypto.randomUUID()` does all of this internally and returns the formatted string directly. We prefer it because it is implemented in C++ inside the engine — it skips the JS-level byte juggling, has been audited as part of the Web Crypto conformance suite, and is approximately 4× faster than the bit-twiddling fallback on V8.",
          ],
        },
        {
          heading: "Step 2 — `crypto.randomUUID` vs `Math.random`-based generators",
          paragraphs: [
            "Until 2021, the canonical npm UUID library (`uuid` v3 and earlier) shipped a CSPRNG-backed v4 — but a depressing number of one-liner UUID snippets on Stack Overflow used `Math.random` directly. Those are still in the wild. They produce UUIDs that *look* identical but contain only `~52 bits` of effective randomness on V8 (the internal state of V8's PRNG is 128 bits but exposes only 52 bits per `Math.random` call), and the next output is fully recoverable from the previous ~5 outputs.",
            "Using a `Math.random`-based UUID generator for idempotency keys is a logic bug (collisions become possible in days, not millennia). Using one for security tokens is a CVE-class bug (predictable session tokens). `crypto.randomUUID` is the only acceptable browser primitive; do not write your own bit-twiddling unless you are writing the fallback path for environments that genuinely lack it.",
          ],
        },
        {
          heading: "Step 3 — Why v4 over v1 (MAC + time)",
          paragraphs: [
            "v1 UUIDs encode the host's MAC address in the last 6 bytes and a 60-bit timestamp (100-nanosecond intervals since 1582-10-15) in the first 8. Two information leaks fall out of this. First, anyone with access to a v1 UUID can compute the MAC address of the machine that generated it — useful for an attacker trying to fingerprint your infrastructure. Second, anyone with access to a v1 UUID can compute the moment it was generated, down to the 100ns; this leaks user-creation timestamps, file-creation timestamps, anything you'd rather not publish.",
            "The 2008 Cookie-jar attack on a popular CMS exploited the second leak: the cookie was a v1 UUID; the attacker computed the timestamp; the timestamp seeded a session-token generator on the same host; the token became predictable. v4 has neither leak. Use v4 unless you have a specific reason not to.",
            "The MAC-address leak is also why modern v1 implementations frequently substitute a random 48-bit \"node ID\" for the real MAC. That makes v1 closer to v4 in practice but with worse storage characteristics (less random, since 60 bits are timestamp), so v4 is still the better default.",
          ],
        },
        {
          heading: "Step 4 — The database problem with random UUIDs",
          paragraphs: [
            "Random UUIDs are bad B-tree primary keys. Here is why: a B-tree index keeps its leaf pages sorted by key. When you insert with an auto-incrementing key, every new row appends to the rightmost leaf — one page touched, one write. When you insert with a random UUID, the new row lands in a random leaf, splitting pages, dirtying pages that had just been flushed from cache, and forcing the storage engine to re-write huge swathes of the tree.",
            "On Postgres, InnoDB, and SQL Server, the symptom is the same: insert throughput collapses (10-50× slower than with auto-increment), index size balloons (because pages are 50-70% full on average instead of 90-95%), and cache hit rate drops (because the working set is the entire index, not just the recent tail). The 2019 Percona benchmark showed InnoDB v4 inserts at 1/30th the throughput of auto-increment at scale.",
          ],
        },
        {
          heading: "Step 5 — v7 (Unix-time prefix) — emerging in PostgreSQL 17, SQL Server 2025, and elsewhere",
          paragraphs: [
            "v7 was finalised in RFC 9562 in May 2024 specifically to fix the B-tree problem. The first 48 bits are a Unix-epoch millisecond timestamp; the next 4 bits are the version (`0111`); the next 12 bits are random (or a monotonic counter, optionally); the next 2 bits are the variant; the last 62 bits are random. Total: 74 bits of randomness, which is enough for application-scale uniqueness with millisecond-resolution ordering.",
            "v7 inserts behave like auto-increment inserts on a B-tree: monotonic prefix, sequential page touches, no fragmentation. PostgreSQL 17 added `uuidv7()` as a built-in function. SQL Server 2025 will ship `NEWUUID7`. MySQL 9 has `UUID_TO_BIN(UUID(), 1)` which approximates the behaviour using v1 with reordered bytes.",
            "We do not currently ship a v7 generator on this page because v7 is still settling — the random-bits-vs-counter sub-decision is implementation-defined, and the 12-bit middle field is interpreted differently by different libraries. Our recommendation: use v4 for opaque application identifiers (idempotency keys, request IDs, file names). Use database-native v7 (or ULID via a server-side library) for primary keys on tables you expect to grow past 10M rows. The two coexist; many applications use v7 as the storage key and a v4 column as the public identifier.",
          ],
        },
        {
          heading: "Step 6 — ULID and KSUID as alternatives",
          paragraphs: [
            "ULID (Universally Unique Lexicographically Sortable Identifier) is a 2016 spec by Alizain Feerasta that solves the same B-tree problem v7 solves, but with a more compact text encoding. 128 bits total: 48-bit millisecond timestamp, 80 bits random, rendered as 26 characters of Crockford Base32. ULIDs sort lexicographically by timestamp; they are case-insensitive; they have no dashes.",
            "KSUID (K-Sortable Unique Identifier) is a 2017 spec by Segment: 32-bit second-resolution timestamp + 128 bits random = 160 bits total, rendered as 27 characters of Base62. Same sorting property as ULID but a wider random field (128 random bits is overkill for almost all use cases).",
            "Both are pure userspace specs — no database-native support outside of extensions. v7 is the standards-track equivalent and is being adopted natively by Postgres, SQL Server, and Oracle in their 2024-2025 releases. For new code, prefer v7 over ULID/KSUID; for code that already uses ULID, no rush to migrate.",
          ],
        },
        {
          heading: "Step 7 — Nothing leaves the browser tab",
          paragraphs: [
            "Generation happens inside the engine instance that loaded this page. `crypto.randomUUID()` returns a string directly; the random bytes never touch JS heap memory in a form your code can inspect (the engine's C++ layer holds them just long enough to format the output). The resulting strings sit in component state and are garbage-collected when you navigate away.",
            "There is no `fetch` call, no analytics event, no `localStorage` write. The trust boundary is the browser tab; everything inside it is yours. This matters less for UUIDs than for passwords — a leaked UUID is not directly exploitable — but the architectural property is the same as our other client-side tools.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Most UUID issues are not generator bugs — they are downstream system constraints (case-sensitivity, dash-stripping, type mismatches) or operational misconceptions (\"we're going to run out of UUIDs\"). The fixes are short.",
      subsections: [
        {
          heading: "\"My database stores it as a string and queries are slow\"",
          paragraphs: [
            "Postgres has a native `uuid` type that stores the value as 16 bytes; MySQL has `BINARY(16)`; SQL Server has `uniqueidentifier`. Always use the native type, never `VARCHAR(36)`. The string version stores 36 bytes per row, indexes the bytes lexically (not as integers), and forces every comparison to byte-walk the string.",
            "If you have a legacy `VARCHAR(36)` column, the migration is mechanical: add a `uuid`-typed sibling column, backfill with a single update, then swap in the application layer. Indexes on the new column will be 2.25× smaller; range scans will be 2-3× faster.",
          ],
        },
        {
          heading: "\"The UUID I generated yesterday and the one today have the same first 8 characters\"",
          paragraphs: [
            "v4 UUIDs are uniformly random — every character of the 32 hex characters (minus the 6 metadata bits) is uniformly distributed. Shared prefixes are by chance, not by design. The probability that two random v4 UUIDs share the first 8 hex chars (32 bits) is 1 in 2^32 ≈ 1 in 4 billion. If you generate enough of them, you will see prefix matches — that's fine.",
            "If you are seeing systematic prefix matches (e.g., every UUID generated by your service starts with the same byte), the bug is upstream: your CSPRNG is seeded with low-entropy material. Check that you are calling `crypto.randomUUID()` and not a custom generator that derives bytes from `Date.now()` or `Math.random`.",
          ],
        },
        {
          heading: "\"How many UUIDs can I generate before collision?\"",
          paragraphs: [
            "The birthday bound for v4 is `2^61` UUIDs before a 50% chance of one collision. At one billion per second, that is 73 years. At a more realistic application rate (1000 UUIDs/second per machine, 1000 machines, so 10^6 UUIDs/second globally), it is 73,000 years.",
            "You will run out of disk before you run out of UUIDs. Stop worrying about UUID collision; start worrying about whether your CSPRNG is well-seeded (the only realistic collision cause).",
          ],
        },
        {
          heading: "\"Should I store UUIDs with or without dashes?\"",
          paragraphs: [
            "If the database has a native UUID type, the on-disk representation is dashless 16 bytes regardless of whether you write the literal as `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'` or `'a0eebc999c0b4ef8bb6d6bb9bd380a11'`. The dashes are a presentation concern only.",
            "If you are storing UUIDs in a string-typed column or in a NoSQL document, pick one form and stick with it. Mixed forms break equality lookups (`'a0eebc99-...'` ≠ `'a0eebc99...'` for the database even though they're the same UUID). The dashed form is more readable in logs; the dashless form is 4 bytes shorter per identifier. Either is fine; consistency is what matters.",
          ],
        },
        {
          heading: "\"Can I shorten a UUID by base64-encoding it?\"",
          paragraphs: [
            "Yes — 16 raw bytes become 22 characters in unpadded base64url. The shortened form is unambiguous (it round-trips back to the same 128 bits) but is no longer a UUID; consumers that expect the canonical `xxxxxxxx-xxxx-...` format will reject it.",
            "If you control both ends (writing to a cookie, embedding in a URL path), base64url is fine and saves 14 characters per identifier. If the UUID will be seen by humans, copied into bug reports, or fed to a third-party system, keep the canonical form.",
          ],
        },
        {
          heading: "Best-practice checklist before relying on a generated UUID",
          paragraphs: [
            "Five habits that prevent almost every UUID-related incident.",
          ],
        },
      ],
      bullets: [
        "Use `crypto.randomUUID()` in the browser and your language's equivalent (`uuid.uuid4()` in Python, `uuid.New()` in Go's `github.com/google/uuid`) on the server. Never write your own v4 generator on top of `Math.random` or `time()`.",
        "Store UUIDs in the database's native UUID type, not `VARCHAR(36)`. The on-disk size and index performance differences are 2-3×.",
        "For primary keys on growth-stage tables, prefer v7 (PostgreSQL 17+, SQL Server 2025+) or ULID over v4. For everything else — public identifiers, idempotency keys, request IDs — v4 is the right default.",
        "Treat UUIDs as opaque. Don't parse the version bits to infer where they came from; don't substring them to make \"short IDs\"; don't compare them with string operations when type-safe comparison is available.",
        "If you generate UUIDs on the client and submit them to the server, the server must still validate them as well-formed UUIDs and treat them as untrusted input. A client can submit any string of 36 characters; only the structural check confirms it's actually a UUID.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · RFC 4122 v4 标识符",
  title:
    "2026 年的 UUID：为什么应用 ID 还是首选 v4、v7 改变了什么、为什么你的数据库可能两个都想要",
  lead:
    "一个 UUID 是 128 位。其中 6 位用于元数据（4 位版本、2 位变体）；另外 122 位是有效载荷。对 v4 来说，那 122 位是均匀随机的——通过浏览器的 `crypto.randomUUID` 或 `crypto.getRandomValues` 从操作系统的 CSPRNG 中抽取。就这么简单。你将读到的所有关于 UUID 生成的内容——碰撞概率、数据库性能、v1 vs v4 vs v7、ULID 和 KSUID——都是这一个事实的下游。本页是这款生成器背后的契约：我们调用哪个 RNG、为什么版本位很重要、什么时候 v4 是对的答案、什么时候可排序替代方案胜出。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "UUID 由 2005 年的 RFC 4122 标准化，最初为 DCE 起草，此后几乎被普遍采用于应用层标识符。2024 年的修订版（RFC 9562）保留了原有的五个版本，并新增了三个版本（v6、v7、v8），针对现代数据库存储模式。v4 仍是不透明标识符的默认；v7 是时序键的新兴选择。",
      subsections: [
        {
          heading: "RFC 4122 / RFC 9562 —— 五个版本各自意味着什么",
          paragraphs: [
            "RFC 4122 在 2005 年定义了五个 UUID 版本，按 122 个非元数据位的来源区分。v1 编码主机 MAC 地址加上 60 位时间戳；它泄露身份和生成时间。v2 是 DCE Security 变体——几乎没人用。v3 和 v5 是基于名字的：把命名空间 UUID 和名字串用 MD5（v3）或 SHA-1（v5）哈希后使用摘要。v4 是纯随机。",
            "RFC 9562（2024 年 5 月）新增三个版本。v6 是把时间戳位重排后的 v1，让字典序匹配创建顺序——解决了 v1 的排序问题但保留了 MAC 泄露。v7 是去掉 MAC 的 v1：48 位 Unix 纪元毫秒时间戳加 74 位随机，其中版本（4 位）和变体（2 位）交错。v8 是供应商扩展槽。",
            "我们的生成器输出 v4，因为 v4 是 95% 的应用代码想要的：一个凭据级随机标识符，没有嵌入元数据、没有时钟依赖、没有隐私顾虑。如果你的使用场景想要排序，我们建议用另一个工具发出 ULID 或 v7；我们刻意把这块界面限定到一个工作上。",
          ],
        },
        {
          heading: "v4 UUID 实际出现在哪些位置",
          paragraphs: [
            "压倒性比例的合规用法落在五种工作流里。",
            "第一，REST 资源标识符 —— `/api/v1/orders/{id}` 里的路径段。随机 UUID 防止 ID 枚举攻击（你猜不到下一个订单 ID）、无需协调即可承受分片、与数据库自增序列解耦。代价是每个标识符 16 字节而不是 `bigint` 的 8 字节，加上失去 B-tree 局部性（见下面的 v7 章节）。",
            "第二，幂等键——客户端在 `Idempotency-Key` 头里发的值，让 `POST` 重试安全。Stripe 在 2017 年推广了这个；如今行业把它视为标准。一个 v4 UUID 是合适的原语：随机到永远不会跨客户端碰撞、不透明到不泄露原请求任何信息。",
            "第三，分布式追踪中的关联/请求 ID。在边缘生成的 v4 UUID 跟随请求穿过每个服务、在每一跳被记录，让你能在 Honeycomb 或 Datadog 中重建调用图。OpenTelemetry 的 W3C `traceparent` 头用的就是一个 128 位 trace-id，结构上就是去掉破折号的 v4 UUID。",
            "第四，用户上传文件的生成文件名。`${crypto.randomUUID()}.jpg` 防止一个用户通过路径冲突覆盖另一个用户的文件、击败目录列表攻击（攻击者无法枚举同级文件名）、并完全避免了用户提供文件名的注入类问题。",
            "第五，匿名客户端标识符——存在 `localStorage` 里的一个 v4，用于在用户认证之前区分浏览器会话。比其他几种低风险一些；分析平台例行这么做。注意这本身*不是*指纹、也不是隐私机制；它是一个逻辑客户端的稳定句柄。",
          ],
        },
        {
          heading: "你实际要担心的碰撞概率",
          paragraphs: [
            "一个 v4 UUID 有 122 个随机位，所以空间是 `2^122 ≈ 5.3 × 10^36` 个不同值。按生日界近似，你需要生成约 `sqrt(2^122) ≈ 2.3 × 10^18` 个 UUID 才会让「一次碰撞」比「无碰撞」更可能。每秒生成一百万个，那需要 73,000 年。",
            "在应用级规模下——哪怕是「十亿用户平台的每个 web 请求」规模——碰撞不是失败模式。失败模式是 *RNG 坏掉*，不是 *RNG 耗尽*。如果你的应用在正常运行中产出了两个相等的 v4 UUID，bug 在上游：要么你的 CSPRNG 种子太烂（虚拟机快照回放是经典案例），要么有人在 `Math.random` 之上写了一个自定义 v4 生成器而不是用 `crypto.randomUUID`。",
            "本生成器委派给 `crypto.randomUUID()`，它由 W3C Web Crypto 规范要求必须使用 CSPRNG，仅在 `randomUUID` 不可用时回退到 `crypto.getRandomValues`。两条路径都走同一个 OS 内核熵池，背后是 Linux 的 `getrandom(2)`、Windows 的 `BCryptGenRandom`、macOS 的 `SecRandomCopyBytes`。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "我们的实现是 25 行 TypeScript。真正有意思的工程在于位布局（如今 `crypto.randomUUID` 把它对你藏起来了）以及「选 v4 而非可排序替代方案」的数据库级后果。",
      subsections: [
        {
          heading: "决策 1 · 位布局：4 位版本、2 位变体、122 位随机",
          paragraphs: [
            "一个 UUID 渲染为 `xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`，其中 M 和 N 编码版本和变体。M 是版本位：对 v4 永远是 `4`。N 是变体——对 RFC 4122 来说是 `8`、`9`、`a` 或 `b`（二进制 `10xx`）。",
            "从原始随机字节实现：从 CSPRNG 填 16 字节，然后把第 6 字节的高 4 位覆盖为 `0100`（版本 4），把第 8 字节的高 2 位覆盖为 `10`（变体 10）。我们的回退路径就这么干：`bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;`。其余 122 位保持随机。",
            "`crypto.randomUUID()` 在内部做完这一切并直接返回格式化字符串。我们偏好它，因为它在引擎里用 C++ 实现——跳过了 JS 层的字节折腾、作为 Web Crypto 一致性测试的一部分被审计过，并且在 V8 上比位操作回退快约 4 倍。",
          ],
        },
        {
          heading: "决策 2 · `crypto.randomUUID` vs 基于 `Math.random` 的生成器",
          paragraphs: [
            "直到 2021 年，npm 上经典的 UUID 库（`uuid` v3 及更早）都搭载 CSPRNG 后端的 v4——但 Stack Overflow 上令人沮丧地大量 UUID 一行代码片段直接用 `Math.random`。那些至今还在野外。它们产出的 UUID *看起来*完全一致，但在 V8 上只含 `~52 位` 有效随机性（V8 的 PRNG 内部状态是 128 位，但每次 `Math.random` 调用只暴露 52 位），而且下一次输出可以从前约 5 次输出完整还原。",
            "用基于 `Math.random` 的 UUID 生成器做幂等键是逻辑 bug（碰撞在数天内就可能，不是数千年）。用它做安全 token 是 CVE 级 bug（可预测的会话 token）。`crypto.randomUUID` 是浏览器里唯一可接受的原语；除非你在为真正缺它的环境写回退路径，否则不要自己写位操作。",
          ],
        },
        {
          heading: "决策 3 · 为什么选 v4 而不是 v1（MAC + 时间）",
          paragraphs: [
            "v1 UUID 在最后 6 字节编码主机的 MAC 地址、在前 8 字节编码 60 位时间戳（自 1582-10-15 起的 100 纳秒间隔）。两个信息泄露由此而来。第一，任何能拿到 v1 UUID 的人都可以算出生成它的机器的 MAC 地址——对想给你的基础设施指纹画像的攻击者很有用。第二，任何能拿到 v1 UUID 的人都可以算出它被生成的瞬间，精确到 100 纳秒；这泄露用户创建时间戳、文件创建时间戳，以及任何你不希望公开的东西。",
            "2008 年针对某流行 CMS 的 Cookie-jar 攻击利用的就是第二条泄露：cookie 是 v1 UUID；攻击者算出时间戳；时间戳用作同主机上会话 token 生成器的种子；token 变得可预测。v4 两条都没有。除非你有具体理由不用，否则用 v4。",
            "MAC 泄露也是为什么现代 v1 实现常常用 48 位随机「节点 ID」替换真实 MAC。这让 v1 在实践中更接近 v4，但存储特性更差（随机性更少，因为 60 位是时间戳），所以 v4 仍是更好的默认。",
          ],
        },
        {
          heading: "决策 4 · 随机 UUID 的数据库问题",
          paragraphs: [
            "随机 UUID 是糟糕的 B-tree 主键。原因如下：B-tree 索引按 key 给叶子页排序。用自增 key 插入时，每行新行都追加到最右叶子——一页被触碰、一次写。用随机 UUID 插入时，新行落到一个随机叶子，分裂页、弄脏刚被换出缓存的页、迫使存储引擎重写大块树。",
            "在 Postgres、InnoDB、SQL Server 上症状一样：插入吞吐崩塌（比自增慢 10-50 倍）、索引体积膨胀（页平均 50-70% 满而不是 90-95%）、缓存命中率下降（因为工作集是整个索引，不是最近的尾部）。2019 年 Percona 的基准显示 InnoDB v4 插入在大规模下只有自增的 1/30 吞吐。",
          ],
        },
        {
          heading: "决策 5 · v7（Unix 时间前缀）—— PostgreSQL 17、SQL Server 2025 等正在引入",
          paragraphs: [
            "v7 在 2024 年 5 月的 RFC 9562 中定稿，专门为修复 B-tree 问题而设。前 48 位是 Unix 纪元毫秒时间戳；接下来 4 位是版本（`0111`）；接下来 12 位是随机（或可选地一个单调计数器）；接下来 2 位是变体；最后 62 位是随机。总计：74 位随机性，对应用级唯一性足够，且具备毫秒分辨率的排序能力。",
            "v7 在 B-tree 上的插入行为像自增插入：单调前缀、连续页触碰、无碎片。PostgreSQL 17 已经把 `uuidv7()` 加为内建函数。SQL Server 2025 将搭载 `NEWUUID7`。MySQL 9 提供 `UUID_TO_BIN(UUID(), 1)`，用重排字节的 v1 来近似这个行为。",
            "我们这一页目前不发 v7 生成器，因为 v7 还在沉淀——「随机位 vs 计数器」的子决策仍是实现自定义的，那 12 位中间字段在不同库里解读不同。我们的建议：用 v4 做不透明应用标识符（幂等键、请求 ID、文件名）。用数据库原生 v7（或服务器端 ULID 库）做你预期会增长超过 1000 万行的表的主键。两者并存；许多应用用 v7 做存储 key、用一个 v4 列做公开标识符。",
          ],
        },
        {
          heading: "决策 6 · ULID 和 KSUID 作为替代",
          paragraphs: [
            "ULID（Universally Unique Lexicographically Sortable Identifier）是 Alizain Feerasta 2016 年的规范，解决和 v7 同样的 B-tree 问题，但文本编码更紧凑。128 位总长：48 位毫秒时间戳 + 80 位随机，渲染为 26 字符 Crockford Base32。ULID 按时间戳字典序排序；大小写不敏感；没有破折号。",
            "KSUID（K-Sortable Unique Identifier）是 Segment 2017 年的规范：32 位秒级时间戳 + 128 位随机 = 共 160 位，渲染为 27 字符 Base62。和 ULID 同样的排序属性，但随机字段更宽（128 位随机对几乎所有用例都是过度）。",
            "两者都是纯用户态规范——数据库原生支持要走扩展。v7 是标准轨道上的对等物，且正被 Postgres、SQL Server、Oracle 在它们 2024-2025 的发布版里原生采纳。新代码优先 v7 而不是 ULID/KSUID；已经用了 ULID 的代码不急着迁移。",
          ],
        },
        {
          heading: "决策 7 · 任何东西都不离开浏览器标签页",
          paragraphs: [
            "生成发生在加载本页的引擎实例里。`crypto.randomUUID()` 直接返回字符串；随机字节从未以你代码能查看的形式触碰过 JS 堆内存（引擎的 C++ 层只在格式化输出之前短暂持有它们）。产出的字符串住在组件状态里，你导航走即被 GC。",
            "没有 `fetch` 调用、没有埋点、没有 `localStorage` 写入。信任边界是浏览器标签页；它里面的一切都是你自己的。对 UUID 来说这一点没有对密码那么重要——泄露的 UUID 不能被直接利用——但架构属性和我们其他客户端工具相同。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "多数 UUID 问题不是生成器 bug——而是下游系统约束（大小写敏感、破折号剥离、类型不匹配）或运维误解（「我们要把 UUID 用完了」）。修复都很短。",
      subsections: [
        {
          heading: "「我的数据库把它存成字符串，查询很慢」",
          paragraphs: [
            "Postgres 有原生 `uuid` 类型，把值存为 16 字节；MySQL 有 `BINARY(16)`；SQL Server 有 `uniqueidentifier`。永远用原生类型，不要用 `VARCHAR(36)`。字符串版每行存 36 字节、按字典序（不是整数）索引字节、并迫使每次比较都按字节走完字符串。",
            "如果你有遗留的 `VARCHAR(36)` 列，迁移很机械：加一个 `uuid` 类型的兄弟列、用一次 update 回填、然后在应用层切换。新列上的索引会小 2.25 倍；范围扫描会快 2-3 倍。",
          ],
        },
        {
          heading: "「我昨天生成的 UUID 和今天的前 8 个字符一样」",
          paragraphs: [
            "v4 UUID 是均匀随机的——32 个十六进制字符（减去 6 个元数据位）的每一位都均匀分布。前缀共享是巧合，不是设计。两个随机 v4 UUID 共享前 8 个 hex 字符（32 位）的概率是 1/2^32 ≈ 1/40 亿。生成的足够多就会看到前缀匹配——没事。",
            "如果你看到的是系统性前缀匹配（比如你服务生成的每个 UUID 都以同一个字节开头），bug 在上游：你的 CSPRNG 用低熵素材播种了。检查你是在调 `crypto.randomUUID()`，不是在用从 `Date.now()` 或 `Math.random` 派生字节的自定义生成器。",
          ],
        },
        {
          heading: "「碰撞之前我能生成多少 UUID？」",
          paragraphs: [
            "v4 的生日界是 `2^61` 个 UUID 才有 50% 概率出现一次碰撞。每秒十亿个，那是 73 年。换成更现实的应用速率（每机每秒 1000 个 UUID、1000 台机器，所以全局每秒 10^6 个），那是 73,000 年。",
            "你会先把磁盘用完，再把 UUID 用完。别担心 UUID 碰撞；开始担心你的 CSPRNG 是否种子充足（唯一现实的碰撞原因）。",
          ],
        },
        {
          heading: "「UUID 该带破折号存储还是不带？」",
          paragraphs: [
            "如果数据库有原生 UUID 类型，无论你字面量写成 `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'` 还是 `'a0eebc999c0b4ef8bb6d6bb9bd380a11'`，磁盘表示都是无破折号的 16 字节。破折号只是呈现层关切。",
            "如果你把 UUID 存在字符串类型的列里或 NoSQL 文档里，挑一种形式坚持用。混合形式会破坏等值查找（对数据库来说 `'a0eebc99-...'` ≠ `'a0eebc99...'`，尽管它们是同一个 UUID）。带破折号的形式在日志里更易读；不带破折号的形式每个标识符省 4 字节。哪种都行；一致性才是关键。",
          ],
        },
        {
          heading: "「我能 base64 编码 UUID 来缩短它吗？」",
          paragraphs: [
            "可以——16 字节原始数据在无填充 base64url 下变成 22 字符。这个缩短形式无歧义（能往返回相同的 128 位），但它不再是 UUID；期待标准 `xxxxxxxx-xxxx-...` 格式的消费者会拒绝它。",
            "如果你两端都控制（写 cookie、嵌入 URL 路径），base64url 没问题，每个标识符省 14 字符。如果 UUID 会被人类看到、被复制到 bug 报告里、被喂给第三方系统，留着标准形式。",
          ],
        },
        {
          heading: "依赖一份生成 UUID 前的最佳实践清单",
          paragraphs: [
            "下面这五条习惯能消灭几乎所有 UUID 相关的事故。",
          ],
        },
      ],
      bullets: [
        "在浏览器里用 `crypto.randomUUID()`，在服务器上用对应语言的等价物（Python 的 `uuid.uuid4()`、Go 的 `github.com/google/uuid` 的 `uuid.New()`）。永远不要在 `Math.random` 或 `time()` 之上自己写 v4 生成器。",
        "把 UUID 存在数据库原生 UUID 类型里，不要 `VARCHAR(36)`。磁盘体积和索引性能差 2-3 倍。",
        "对成长期表的主键，优先 v7（PostgreSQL 17+、SQL Server 2025+）或 ULID 而不是 v4。其他一切——公开标识符、幂等键、请求 ID——v4 是正确默认。",
        "把 UUID 视作不透明。不要解析版本位推断它来自哪里；不要截取子串造「短 ID」；可用类型安全比较时不要用字符串运算比较。",
        "如果你在客户端生成 UUID 再提交到服务器，服务器仍必须把它当不可信输入校验为格式良好的 UUID。客户端可以提交任意 36 字符字符串；只有结构校验能确认它真的是一个 UUID。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
